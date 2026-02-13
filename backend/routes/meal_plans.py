"""
Meal Plan Routes - Python Age 5.0

Plan your meals, and everything syncs automatically.
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import date
import logging

from models.meal_plan import MealPlanCreate, MealPlanUpdate
from utils.auth import get_current_household
from db import get_db
from state_manager import StateManager

logger = logging.getLogger(__name__)

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
    db = get_db()

    def update():
        insert_data = {
            'household_id': household_id,
            'planned_date': meal.date.isoformat(),
            'recipe_id': meal.recipe_id,
            'is_cooked': False
        }
        logger.info(f"Inserting meal plan: {insert_data}")

        result = db.meal_plans.create(insert_data)

        if not result:
            logger.error(f"Meal plan insert returned no data")
            raise HTTPException(500, "Failed to create meal plan")

        return result[0]['id']

    try:
        meal_id = StateManager.update_and_invalidate(household_id, update)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add meal plan: {e}", exc_info=True)
        raise HTTPException(500, "Failed to add meal plan")

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "id": meal_id,
        "meal_plans": [m.model_dump() for m in state.meal_plans],
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
    db = get_db()

    def update():
        update_data = {}
        if meal.date is not None:
            update_data['planned_date'] = meal.date.isoformat()
        if meal.recipe_id is not None:
            update_data['recipe_id'] = meal.recipe_id
        if meal.cooked is not None:
            update_data['is_cooked'] = meal.cooked

        if update_data:
            db.meal_plans.update(meal_id, household_id, update_data)

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
    db = get_db()

    def update():
        db.meal_plans.delete(meal_id, household_id)

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

    db = get_db()

    def update():
        # Get the meal
        meal_data = db.meal_plans.get_by_id(meal_id, household_id)

        if not meal_data:
            raise HTTPException(404, "Meal not found")

        meal = meal_data[0]
        serving_multiplier = meal.get('serving_multiplier', 1.0) or 1.0

        # Get the recipe (ingredients stored as JSONB in recipes table)
        recipe_data = db.recipes.get_by_id(meal['recipe_id'])

        if not recipe_data:
            raise HTTPException(404, "Recipe not found")

        recipe = recipe_data[0]
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
            pantry_items = db.pantry.find_by_name_ilike(household_id, ing_name)

            # Filter by unit match
            matching_items = [
                item for item in pantry_items
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
                        db.pantry.update_location(location['id'], {'quantity': new_qty})
                        remaining = 0
                    else:
                        remaining -= loc_qty
                        db.pantry.update_location(location['id'], {'quantity': 0})

        # Mark meal as cooked
        db.meal_plans.update_by_id(meal_id, {'is_cooked': True})

    StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "meal_plans": [meal.model_dump() for meal in state.meal_plans],
        "pantry_items": [item.model_dump() for item in state.pantry_items],
        "shopping_list": [item.model_dump() for item in state.shopping_list]
    }
