"""
Database Provider Interface - Chef's Kiss

Abstract interface for all database operations.
Implementations: SupabaseDatabaseProvider (current), PostgresDatabaseProvider (future).

All data methods return plain dicts/lists — no ORM-specific objects leak through.
"""

from abc import ABC, abstractmethod
from typing import List, Optional


# ===== AUTH =====

class AuthProvider(ABC):
    """Authentication operations."""

    @abstractmethod
    def sign_up(self, email: str, password: str) -> dict:
        """Create new user account.
        Returns: {"user": {"id", "email"} | None, "session": dict | None}
        """
        ...

    @abstractmethod
    def sign_in_with_password(self, email: str, password: str) -> dict:
        """Sign in existing user.
        Returns: {"user": {"id", "email"} | None, "session": dict | None}
        """
        ...

    @abstractmethod
    def sign_out(self) -> None:
        """Sign out current user."""
        ...

    @abstractmethod
    def refresh_session(self, refresh_token: str) -> dict:
        """Refresh access token.
        Returns: {"session": {"access_token", "refresh_token", "expires_in"} | None}
        """
        ...

    @abstractmethod
    def get_user(self, token: str) -> dict:
        """Validate token and get user info.
        Returns: {"user": {"id", "email", "role"} | None}
        """
        ...


# ===== PANTRY =====

class PantryProvider(ABC):
    """Pantry item and location operations."""

    @abstractmethod
    def get_items_with_locations(self, household_id: str) -> List[dict]:
        """Get all pantry items with nested pantry_locations."""
        ...

    @abstractmethod
    def get_item_units(self, household_id: str) -> List[dict]:
        """Get units used in pantry items. Returns [{"unit": str}, ...]"""
        ...

    @abstractmethod
    def create_item(self, data: dict) -> List[dict]:
        """Create a pantry item. Returns [created_row]."""
        ...

    @abstractmethod
    def update_item(self, item_id: str, household_id: str, data: dict) -> List[dict]:
        """Update a pantry item by id + household scope."""
        ...

    @abstractmethod
    def delete_item(self, item_id: str, household_id: str) -> None:
        """Delete a pantry item."""
        ...

    @abstractmethod
    def find_by_name_ilike(self, household_id: str, name: str) -> List[dict]:
        """Case-insensitive name search with nested locations."""
        ...

    @abstractmethod
    def find_by_name_and_unit(self, household_id: str, name: str, unit: str) -> List[dict]:
        """Case-insensitive name + exact unit. Returns [{"id": str}]."""
        ...

    @abstractmethod
    def create_location(self, data: dict) -> List[dict]:
        """Create a pantry location entry."""
        ...

    @abstractmethod
    def update_location(self, location_id: str, data: dict) -> List[dict]:
        """Update a pantry location."""
        ...

    @abstractmethod
    def delete_locations_for_item(self, item_id: str) -> None:
        """Delete all locations for a pantry item."""
        ...

    @abstractmethod
    def get_locations(self, item_id: str, limit: Optional[int] = None) -> List[dict]:
        """Get locations for a pantry item."""
        ...


# ===== RECIPES =====

class RecipeProvider(ABC):
    """Recipe operations."""

    @abstractmethod
    def get_all(self, household_id: str) -> List[dict]:
        """Get all recipes for a household."""
        ...

    @abstractmethod
    def get_by_id(self, recipe_id: str) -> List[dict]:
        """Get a recipe by ID."""
        ...

    @abstractmethod
    def get_ingredients_only(self, household_id: str) -> List[dict]:
        """Get just ingredients field. Returns [{"ingredients": [...]}, ...]"""
        ...

    @abstractmethod
    def create(self, data: dict) -> List[dict]:
        """Create a recipe."""
        ...

    @abstractmethod
    def update(self, recipe_id: str, household_id: str, data: dict) -> List[dict]:
        """Update a recipe."""
        ...

    @abstractmethod
    def delete(self, recipe_id: str, household_id: str) -> None:
        """Delete a recipe."""
        ...


# ===== MEAL PLANS =====

class MealPlanProvider(ABC):
    """Meal plan operations."""

    @abstractmethod
    def get_upcoming(self, household_id: str, from_date: str) -> List[dict]:
        """Get meal plans from date onwards."""
        ...

    @abstractmethod
    def get_by_id(self, meal_id: str, household_id: str) -> List[dict]:
        """Get a specific meal plan."""
        ...

    @abstractmethod
    def create(self, data: dict) -> List[dict]:
        """Create a meal plan."""
        ...

    @abstractmethod
    def update(self, meal_id: str, household_id: str, data: dict) -> List[dict]:
        """Update a meal plan with household scope."""
        ...

    @abstractmethod
    def update_by_id(self, meal_id: str, data: dict) -> List[dict]:
        """Update a meal plan by ID only (no household filter)."""
        ...

    @abstractmethod
    def delete(self, meal_id: str, household_id: str) -> None:
        """Delete a meal plan."""
        ...


# ===== SHOPPING =====

class ShoppingProvider(ABC):
    """Shopping list (manual items) operations."""

    @abstractmethod
    def get_manual_items(self, household_id: str) -> List[dict]:
        """Get all manual shopping items."""
        ...

    @abstractmethod
    def create_manual_item(self, data: dict) -> List[dict]:
        """Create a manual shopping item."""
        ...

    @abstractmethod
    def update_manual_item(self, item_id: str, household_id: str, data: dict) -> List[dict]:
        """Update a manual shopping item."""
        ...

    @abstractmethod
    def delete_manual_item(self, item_id: str, household_id: str) -> None:
        """Delete a manual shopping item."""
        ...

    @abstractmethod
    def delete_checked_items(self, household_id: str) -> None:
        """Delete all checked manual items."""
        ...


# ===== SETTINGS =====

class SettingsProvider(ABC):
    """Household settings operations."""

    @abstractmethod
    def get(self, household_id: str, fields: str = '*') -> List[dict]:
        """Get settings for a household. Returns [] if none exist."""
        ...

    @abstractmethod
    def create(self, data: dict) -> List[dict]:
        """Create a settings row."""
        ...

    @abstractmethod
    def update(self, household_id: str, data: dict) -> List[dict]:
        """Update settings for a household."""
        ...


# ===== HOUSEHOLDS =====

class HouseholdProvider(ABC):
    """Household, membership, and invite operations."""

    # --- Households ---

    @abstractmethod
    def get_by_ids(self, ids: List[str], fields: str = 'id, name, created_at') -> List[dict]:
        """Get households by list of IDs."""
        ...

    @abstractmethod
    def get_by_id_single(self, household_id: str, fields: str = 'name') -> dict:
        """Get a single household by ID. Raises if not found."""
        ...

    @abstractmethod
    def create(self, data: dict) -> List[dict]:
        """Create a household."""
        ...

    # --- Members ---

    @abstractmethod
    def get_memberships(self, user_id: str, fields: str = 'household_id') -> List[dict]:
        """Get all household memberships for a user."""
        ...

    @abstractmethod
    def get_first_membership(self, user_id: str) -> List[dict]:
        """Get first household membership for a user (limit 1)."""
        ...

    @abstractmethod
    def get_members(self, household_id: str, fields: str = 'user_id, role, created_at') -> List[dict]:
        """Get all members of a household."""
        ...

    @abstractmethod
    def check_membership(self, user_id: str, household_id: str) -> List[dict]:
        """Check if user is a member. Returns [{"id": ...}] or []."""
        ...

    @abstractmethod
    def check_membership_with_role(self, household_id: str, user_id: str) -> List[dict]:
        """Check membership and get role. Returns [{"id", "role"}] or []."""
        ...

    @abstractmethod
    def add_member(self, data: dict) -> List[dict]:
        """Add a member to a household."""
        ...

    @abstractmethod
    def remove_member(self, household_id: str, user_id: str) -> None:
        """Remove a member from a household."""
        ...

    # --- Invites ---

    @abstractmethod
    def create_invite(self, data: dict) -> List[dict]:
        """Create a household invite."""
        ...

    @abstractmethod
    def get_active_invite(self, household_id: str, now_iso: str) -> List[dict]:
        """Get the most recent active (unused, unexpired) invite."""
        ...

    @abstractmethod
    def find_valid_invite(self, code: str, now_iso: str) -> List[dict]:
        """Find a valid invite by code."""
        ...

    @abstractmethod
    def mark_invite_used(self, invite_id: str, data: dict) -> None:
        """Mark an invite as used."""
        ...


# ===== MAIN PROVIDER =====

class DatabaseProvider(ABC):
    """
    Main database provider interface.

    Aggregates all domain providers into a single entry point.
    Usage: db = get_db(); db.pantry.get_items_with_locations(hid)
    """

    @property
    @abstractmethod
    def auth(self) -> AuthProvider:
        ...

    @property
    @abstractmethod
    def pantry(self) -> PantryProvider:
        ...

    @property
    @abstractmethod
    def recipes(self) -> RecipeProvider:
        ...

    @property
    @abstractmethod
    def meal_plans(self) -> MealPlanProvider:
        ...

    @property
    @abstractmethod
    def shopping(self) -> ShoppingProvider:
        ...

    @property
    @abstractmethod
    def settings(self) -> SettingsProvider:
        ...

    @property
    @abstractmethod
    def households(self) -> HouseholdProvider:
        ...
