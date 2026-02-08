"""
Meal Plan Routes - Python Age 5.0

Plan your meals, and everything syncs automatically.
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import date

from models.meal_plan import MealPlanCreate, MealPlanUpdate
from utils.auth import get_current_household
from utils.supabase_client import get_supabase
from state_manager import StateManager

router = APIRouter(prefix="/api/meal-plans", tags=["meal_plans"])


@router.get("/")
async def get_meal_plans(household_id: str = Depends(get_current_household)):
    """
    Get all upcoming meal plans.

    Returns meal plans + reserved ingredients + shopping list.
    """
    state = StateManager.get_state(household_id)

    return {
        "meal_plans": [meal.model_dump() for meal in state.meal_plans],
        "reserved_ingredients": state.reserved_ingredients,
        "shopping_list": [item.model_dump() for item in state.shopping_list]
    }


@router.post("/")
async def add_meal_plan(
    meal: MealPlanCreate,
    household_id: str = Depends(get_current_household)
):
    """
    Add meal to plan.

    Reserved ingredients and shopping list update automatically!
    """
    supabase = get_supabase()

    def update():
        response = supabase.table('meal_plans').insert({
            'household_id': household_id,
            'planned_date': meal.date.isoformat(),
            'recipe_id': meal.recipe_id,
            'serving_multiplier': meal.serving_multiplier,
            'is_cooked': False
        }).execute()

        return response.data[0]['id']

    meal_id = StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "id": meal_id,
        "meal_plans": [meal.model_dump() for meal in state.meal_plans],
        "reserved_ingredients": state.reserved_ingredients,
        "shopping_list": [item.model_dump() for item in state.shopping_list]
    }


@router.put("/{meal_id}")
async def update_meal_plan(
    meal_id: str,
    meal: MealPlanUpdate,
    household_id: str = Depends(get_current_household)
):
    """
    Update meal plan.
    """
    supabase = get_supabase()

    def update():
        update_data = {}
        if meal.date is not None:
            update_data['planned_date'] = meal.date.isoformat()
        if meal.recipe_id is not None:
            update_data['recipe_id'] = meal.recipe_id
        if meal.serving_multiplier is not None:
            update_data['serving_multiplier'] = meal.serving_multiplier
        if meal.cooked is not None:
            update_data['is_cooked'] = meal.cooked

        if update_data:
            supabase.table('meal_plans').update(update_data)\
                .eq('id', meal_id)\
                .eq('household_id', household_id)\
                .execute()

    StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "meal_plans": [meal.model_dump() for meal in state.meal_plans],
        "reserved_ingredients": state.reserved_ingredients,
        "shopping_list": [item.model_dump() for item in state.shopping_list]
    }


@router.delete("/{meal_id}")
async def delete_meal_plan(
    meal_id: str,
    household_id: str = Depends(get_current_household)
):
    """
    Delete meal from plan.

    Shopping list updates automatically!
    """
    supabase = get_supabase()

    def update():
        supabase.table('meal_plans')\
            .delete()\
            .eq('id', meal_id)\
            .eq('household_id', household_id)\
            .execute()

    StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "meal_plans": [meal.model_dump() for meal in state.meal_plans],
        "reserved_ingredients": state.reserved_ingredients,
        "shopping_list": [item.model_dump() for item in state.shopping_list]
    }


@router.post("/{meal_id}/validate")
async def validate_can_cook(
    meal_id: str,
    household_id: str = Depends(get_current_household)
):
    """
    Validate if meal can be cooked with current pantry.

    Returns missing ingredients if any.
    """
    state = StateManager.get_state(household_id)

    validation = state.validate_can_cook_meal(meal_id)

    return validation


@router.post("/{meal_id}/cook")
async def mark_meal_cooked(
    meal_id: str,
    force: bool = False,
    household_id: str = Depends(get_current_household)
):
    """
    Mark meal as cooked and deplete pantry.

    Uses database transaction to prevent race conditions!
    Validates ingredients first unless force=True.
    """
    state = StateManager.get_state(household_id)

    # Validate first (unless forced)
    if not force:
        validation = state.validate_can_cook_meal(meal_id)

        if not validation['can_cook']:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Not enough ingredients to cook this meal",
                    "missing": validation['missing'],
                    "recipe": validation.get('recipe_name')
                }
            )

    supabase = get_supabase()

    def update():
        # Get the meal
        meal_response = supabase.table('meal_plans')\
            .select('*')\
            .eq('id', meal_id)\
            .eq('household_id', household_id)\
            .execute()

        if not meal_response.data:
            raise HTTPException(404, "Meal not found")

        meal = meal_response.data[0]
        serving_multiplier = meal.get('serving_multiplier', 1.0) or 1.0

        # Get the recipe (ingredients stored as JSONB in recipes table)
        recipe_response = supabase.table('recipes')\
            .select('*')\
            .eq('id', meal['recipe_id'])\
            .execute()

        if not recipe_response.data:
            raise HTTPException(404, "Recipe not found")

        recipe = recipe_response.data[0]
        ingredients = recipe.get('ingredients', []) or []

        # Deplete pantry for each ingredient
        for ingredient in ingredients:
            ing_name = ingredient.get('name', '')
            ing_unit = ingredient.get('unit', '')
            ing_qty = ingredient.get('quantity', 0) or 0
            qty_needed = ing_qty * serving_multiplier

            if not ing_name or qty_needed <= 0:
                continue

            # Find pantry item by name (case-insensitive) and unit
            pantry_response = supabase.table('pantry_items')\
                .select('*, pantry_locations(*)')\
                .eq('household_id', household_id)\
                .ilike('name', ing_name)\
                .execute()

            # Filter by unit match
            matching_items = [
                item for item in pantry_response.data
                if item.get('unit', '').lower() == ing_unit.lower()
            ]

            if matching_items:
                pantry_item = matching_items[0]

                # Deplete from locations (FIFO - oldest expiration first)
                locations = sorted(
                    pantry_item.get('pantry_locations', []),
                    key=lambda loc: loc.get('expiration_date') or '9999-12-31'
                )

                remaining = qty_needed
                for location in locations:
                    if remaining <= 0:
                        break

                    loc_qty = location.get('quantity', 0) or 0
                    if loc_qty >= remaining:
                        new_qty = loc_qty - remaining
                        supabase.table('pantry_locations')\
                            .update({'quantity': new_qty})\
                            .eq('id', location['id'])\
                            .execute()
                        remaining = 0
                    else:
                        remaining -= loc_qty
                        supabase.table('pantry_locations')\
                            .update({'quantity': 0})\
                            .eq('id', location['id'])\
                            .execute()

        # Mark meal as cooked
        supabase.table('meal_plans')\
            .update({'is_cooked': True})\
            .eq('id', meal_id)\
            .execute()

    StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "meal_plans": [meal.model_dump() for meal in state.meal_plans],
        "pantry_items": [item.model_dump() for item in state.pantry_items],
        "shopping_list": [item.model_dump() for item in state.shopping_list]
    }
