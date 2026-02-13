"""
Settings Routes - Python Age 5.0

Household settings for categories, locations, etc.
Replaces localStorage with proper database storage.
"""

from fastapi import APIRouter, Depends, HTTPException
import logging

from models.settings import HouseholdSettings, SettingsUpdate
from utils.auth import get_current_household
from db import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])
logger = logging.getLogger(__name__)

# Default values
DEFAULT_LOCATIONS = ['Pantry', 'Refrigerator', 'Freezer', 'Cabinet', 'Counter']
DEFAULT_CATEGORIES = ['Meat', 'Dairy', 'Produce', 'Pantry', 'Frozen', 'Spices', 'Beverages', 'Snacks', 'Other']


@router.get("/")
async def get_settings(household_id: str = Depends(get_current_household)):
    """
    Get household settings.

    Creates default settings if none exist.
    Falls back to defaults if table doesn't exist yet.
    """
    db = get_db()

    try:
        # Try to get existing settings
        rows = db.settings.get(household_id)

        if rows:
            settings = HouseholdSettings.from_supabase(rows[0])
        else:
            # Create default settings
            logger.info(f"Creating default settings for household {household_id}")
            insert_result = db.settings.create({
                'household_id': household_id,
                'locations': DEFAULT_LOCATIONS,
                'categories': DEFAULT_CATEGORIES,
                'category_emojis': {}
            })

            settings = HouseholdSettings.from_supabase(insert_result[0])

        return {
            "settings": settings.model_dump(),
            "locations": settings.locations,
            "categories": settings.categories,
            "category_emojis": settings.category_emojis
        }
    except Exception as e:
        # Table doesn't exist yet - return defaults
        logger.warning(f"household_settings table not available, using defaults: {e}")
        return {
            "settings": None,
            "locations": DEFAULT_LOCATIONS,
            "categories": DEFAULT_CATEGORIES,
            "category_emojis": {}
        }


@router.put("/")
async def update_settings(
    update: SettingsUpdate,
    household_id: str = Depends(get_current_household)
):
    """
    Update household settings.

    Only updates fields that are provided.
    """
    db = get_db()

    # Build update dict (only include provided fields)
    update_data = {}
    if update.locations is not None:
        update_data['locations'] = update.locations
    if update.categories is not None:
        update_data['categories'] = update.categories
    if update.category_emojis is not None:
        update_data['category_emojis'] = update.category_emojis

    if not update_data:
        # Nothing to update, just return current settings
        return await get_settings(household_id)

    try:
        # Check if settings exist
        existing = db.settings.get(household_id, 'id')

        if existing:
            # Update existing
            result = db.settings.update(household_id, update_data)
        else:
            # Create new with updates
            update_data['household_id'] = household_id
            result = db.settings.create(update_data)

        settings = HouseholdSettings.from_supabase(result[0])

        return {
            "settings": settings.model_dump(),
            "locations": settings.locations,
            "categories": settings.categories,
            "category_emojis": settings.category_emojis,
            "message": "Settings saved"
        }
    except Exception as e:
        # Table doesn't exist - return what was requested as "saved"
        logger.warning(f"household_settings table not available: {e}")
        return {
            "settings": None,
            "locations": update.locations or DEFAULT_LOCATIONS,
            "categories": update.categories or DEFAULT_CATEGORIES,
            "category_emojis": update.category_emojis or {},
            "message": "Settings saved (table not yet created - run migration)"
        }


@router.post("/locations")
async def add_location(
    location: dict,
    household_id: str = Depends(get_current_household)
):
    """Add a new location."""
    name = location.get('name', '').strip()
    if not name:
        raise HTTPException(status_code=400, detail="Location name required")

    db = get_db()

    # Get current settings
    rows = db.settings.get(household_id, 'locations')

    if rows:
        locations = rows[0].get('locations', DEFAULT_LOCATIONS)
    else:
        locations = DEFAULT_LOCATIONS.copy()

    # Add if not already present
    if name not in locations:
        locations.append(name)

        if rows:
            db.settings.update(household_id, {'locations': locations})
        else:
            db.settings.create({
                'household_id': household_id,
                'locations': locations
            })

    return {"locations": locations, "message": f"Location '{name}' added"}


@router.delete("/locations/{location_name}")
async def remove_location(
    location_name: str,
    household_id: str = Depends(get_current_household)
):
    """Remove a location."""
    db = get_db()

    rows = db.settings.get(household_id, 'locations')

    if rows:
        locations = rows[0].get('locations', DEFAULT_LOCATIONS)
        if location_name in locations:
            locations.remove(location_name)
            db.settings.update(household_id, {'locations': locations})

    return {"locations": locations, "message": f"Location '{location_name}' removed"}


@router.post("/categories")
async def add_category(
    category: dict,
    household_id: str = Depends(get_current_household)
):
    """Add a new category."""
    name = category.get('name', '').strip()
    emoji = category.get('emoji', '')

    if not name:
        raise HTTPException(status_code=400, detail="Category name required")

    db = get_db()

    # Get current settings
    rows = db.settings.get(household_id, 'categories, category_emojis')

    if rows:
        categories = rows[0].get('categories', DEFAULT_CATEGORIES)
        emojis = rows[0].get('category_emojis', {})
    else:
        categories = DEFAULT_CATEGORIES.copy()
        emojis = {}

    # Add if not already present
    if name not in categories:
        categories.append(name)

    # Update emoji if provided
    if emoji:
        emojis[name] = emoji

    if rows:
        db.settings.update(household_id, {'categories': categories, 'category_emojis': emojis})
    else:
        db.settings.create({
            'household_id': household_id,
            'categories': categories,
            'category_emojis': emojis
        })

    return {
        "categories": categories,
        "category_emojis": emojis,
        "message": f"Category '{name}' added"
    }


@router.delete("/categories/{category_name}")
async def remove_category(
    category_name: str,
    household_id: str = Depends(get_current_household)
):
    """Remove a category."""
    db = get_db()

    rows = db.settings.get(household_id, 'categories, category_emojis')

    if rows:
        categories = rows[0].get('categories', DEFAULT_CATEGORIES)
        emojis = rows[0].get('category_emojis', {})

        if category_name in categories:
            categories.remove(category_name)
        if category_name in emojis:
            del emojis[category_name]

        db.settings.update(household_id, {'categories': categories, 'category_emojis': emojis})
    else:
        categories = DEFAULT_CATEGORIES
        emojis = {}

    return {
        "categories": categories,
        "category_emojis": emojis,
        "message": f"Category '{category_name}' removed"
    }
