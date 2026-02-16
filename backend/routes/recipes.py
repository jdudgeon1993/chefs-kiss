"""
Recipe Routes - Python Age 5.0

Recipes with smart search and filtering.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from typing import List, Optional
import uuid
import logging

from models.recipe import RecipeCreate, RecipeUpdate
from utils.auth import get_current_household
from utils.supabase_client import get_supabase
from db import get_db
from state_manager import StateManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("/")
async def get_recipes(household_id: str = Depends(get_current_household)):
    """
    Get all recipes.
    """
    state = StateManager.get_state(household_id)

    return {
        "recipes": [recipe.model_dump() for recipe in state.recipes],
        "ready_to_cook": state.ready_to_cook_recipe_ids
    }


@router.get("/search")
async def search_recipes(
    q: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    ready_only: bool = False,
    has_ingredients: Optional[List[str]] = Query(None),
    household_id: str = Depends(get_current_household)
):
    """
    Search and filter recipes.

    Args:
        q: Search term (searches recipe name)
        tags: Filter by tags
        ready_only: Only show ready-to-cook recipes
        has_ingredients: Filter by ingredients
    """
    state = StateManager.get_state(household_id)
    recipes = state.recipes

    # Filter by search term
    if q:
        q_lower = q.lower()
        recipes = [r for r in recipes if q_lower in r.name.lower()]

    # Filter by tags
    if tags:
        recipes = [r for r in recipes if any(tag in r.tags for tag in tags)]

    # Filter by ready to cook
    if ready_only:
        recipes = [r for r in recipes if r.id in state.ready_to_cook_recipe_ids]

    # Filter by ingredients
    if has_ingredients:
        has_lower = [ing.lower() for ing in has_ingredients]
        recipes = [
            r for r in recipes
            if any(ing.lower() in [i.name.lower() for i in r.ingredients] for ing in has_lower)
        ]

    return {
        "recipes": [recipe.model_dump() for recipe in recipes],
        "total": len(recipes)
    }


ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload-photo")
async def upload_recipe_photo(
    file: UploadFile = File(...),
    household_id: str = Depends(get_current_household)
):
    """
    Upload a recipe photo to Supabase Storage.
    Returns the public URL for use in recipe create/update.
    """
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(status_code=400, detail="File must be JPEG, PNG, WebP, or GIF")

    contents = await file.read()
    if len(contents) > MAX_PHOTO_SIZE:
        raise HTTPException(status_code=400, detail="File must be under 5 MB")

    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[-1] if '.' in file.filename else 'jpg'
    storage_path = f"{household_id}/{uuid.uuid4().hex}.{ext}"

    try:
        supabase = get_supabase()
        supabase.storage.from_("recipe-photos").upload(
            storage_path,
            contents,
            {"content-type": file.content_type}
        )
        public_url = supabase.storage.from_("recipe-photos").get_public_url(storage_path)
        return {"url": public_url}
    except Exception as e:
        logger.error(f"Photo upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload photo")


@router.get("/{recipe_id}")
async def get_recipe(
    recipe_id: str,
    household_id: str = Depends(get_current_household)
):
    """
    Get single recipe by ID.
    """
    state = StateManager.get_state(household_id)

    recipe = next((r for r in state.recipes if r.id == recipe_id), None)

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return {
        "recipe": recipe.model_dump(),
        "ready_to_cook": recipe.id in state.ready_to_cook_recipe_ids
    }


@router.post("/")
async def add_recipe(
    recipe: RecipeCreate,
    household_id: str = Depends(get_current_household)
):
    """
    Add new recipe.
    """
    db = get_db()

    def update():
        # Insert recipe with ingredients as JSONB
        recipe_data = db.recipes.create({
            'household_id': household_id,
            'name': recipe.name,
            'servings': recipe.servings,
            'category': recipe.category,
            'tags': recipe.tags,
            'photo': recipe.photo_url,
            'instructions': recipe.instructions,
            'favorite': recipe.is_favorite,
            'ingredients': recipe.ingredients  # Store as JSONB
        })

        recipe_id = recipe_data[0]['id']
        return recipe_id

    recipe_id = StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "id": recipe_id,
        "recipes": [recipe.model_dump() for recipe in state.recipes],
        "ready_to_cook": state.ready_to_cook_recipe_ids
    }


@router.put("/{recipe_id}")
async def update_recipe(
    recipe_id: str,
    recipe: RecipeUpdate,
    household_id: str = Depends(get_current_household)
):
    """
    Update existing recipe.
    """
    db = get_db()

    def update():
        # Build update dict with all provided fields
        update_data = {}
        if recipe.name is not None:
            update_data['name'] = recipe.name
        if recipe.servings is not None:
            update_data['servings'] = recipe.servings
        if recipe.category is not None:
            update_data['category'] = recipe.category
        if recipe.tags is not None:
            update_data['tags'] = recipe.tags
        if recipe.photo_url is not None:
            update_data['photo'] = recipe.photo_url
        if recipe.instructions is not None:
            update_data['instructions'] = recipe.instructions
        if recipe.is_favorite is not None:
            update_data['favorite'] = recipe.is_favorite
        if recipe.ingredients is not None:
            update_data['ingredients'] = recipe.ingredients

        # Single atomic update with all fields
        if update_data:
            db.recipes.update(recipe_id, household_id, update_data)

    StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "recipes": [recipe.model_dump() for recipe in state.recipes],
        "ready_to_cook": state.ready_to_cook_recipe_ids
    }


@router.delete("/{recipe_id}")
async def delete_recipe(
    recipe_id: str,
    household_id: str = Depends(get_current_household)
):
    """
    Delete recipe.
    """
    db = get_db()

    def update():
        # Delete recipe (ingredients stored as JSONB, no separate table)
        db.recipes.delete(recipe_id, household_id)

    StateManager.update_and_invalidate(household_id, update)

    # Return fresh state
    state = StateManager.get_state(household_id)

    return {
        "recipes": [recipe.model_dump() for recipe in state.recipes],
        "ready_to_cook": state.ready_to_cook_recipe_ids
    }


@router.get("/{recipe_id}/scaled")
async def get_scaled_recipe(
    recipe_id: str,
    multiplier: float = 1.0,
    household_id: str = Depends(get_current_household)
):
    """
    Get recipe with scaled ingredient quantities.

    Args:
        multiplier: Serving multiplier (e.g., 2.0 for double)
    """
    state = StateManager.get_state(household_id)

    recipe = next((r for r in state.recipes if r.id == recipe_id), None)

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Scale ingredients
    scaled_recipe = recipe.model_dump()
    scaled_recipe['serving_multiplier'] = multiplier
    scaled_recipe['ingredients'] = [
        {
            **ing,
            'quantity': ing['quantity'] * multiplier
        }
        for ing in scaled_recipe['ingredients']
    ]

    return {"recipe": scaled_recipe}
