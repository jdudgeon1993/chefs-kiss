"""
Supabase Implementation of DatabaseProvider - Chef's Kiss

Wraps all existing Supabase calls behind the abstract provider interface.
Every method here corresponds to a direct Supabase SDK call from the original codebase.
"""

from typing import List, Optional

from db.provider import (
    DatabaseProvider, AuthProvider, PantryProvider, RecipeProvider,
    MealPlanProvider, ShoppingProvider, SettingsProvider, HouseholdProvider
)


# ===== AUTH =====

class SupabaseAuthProvider(AuthProvider):
    def __init__(self, client):
        self._client = client

    def sign_up(self, email: str, password: str) -> dict:
        response = self._client.auth.sign_up({"email": email, "password": password})
        return {
            "user": {"id": response.user.id, "email": response.user.email} if response.user else None,
            "session": response.session.model_dump() if response.session else None
        }

    def sign_in_with_password(self, email: str, password: str) -> dict:
        response = self._client.auth.sign_in_with_password({"email": email, "password": password})
        return {
            "user": {"id": response.user.id, "email": response.user.email} if response.user else None,
            "session": response.session.model_dump() if response.session else None
        }

    def sign_out(self) -> None:
        self._client.auth.sign_out()

    def refresh_session(self, refresh_token: str) -> dict:
        response = self._client.auth.refresh_session(refresh_token)
        return {
            "session": {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_in": response.session.expires_in
            } if response.session else None
        }

    def get_user(self, token: str) -> dict:
        response = self._client.auth.get_user(token)
        if response and response.user:
            user = response.user
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role if hasattr(user, 'role') else None
                }
            }
        return {"user": None}


# ===== PANTRY =====

class SupabasePantryProvider(PantryProvider):
    def __init__(self, client):
        self._client = client

    def get_items_with_locations(self, household_id: str) -> List[dict]:
        resp = self._client.table('pantry_items')\
            .select('*, pantry_locations(*)')\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def get_item_units(self, household_id: str) -> List[dict]:
        resp = self._client.table('pantry_items')\
            .select('unit')\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def create_item(self, data: dict) -> List[dict]:
        resp = self._client.table('pantry_items').insert(data).execute()
        return resp.data

    def update_item(self, item_id: str, household_id: str, data: dict) -> List[dict]:
        resp = self._client.table('pantry_items').update(data)\
            .eq('id', item_id)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def delete_item(self, item_id: str, household_id: str) -> None:
        self._client.table('pantry_items')\
            .delete()\
            .eq('id', item_id)\
            .eq('household_id', household_id)\
            .execute()

    def find_by_name_ilike(self, household_id: str, name: str) -> List[dict]:
        resp = self._client.table('pantry_items')\
            .select('*, pantry_locations(*)')\
            .eq('household_id', household_id)\
            .ilike('name', name)\
            .execute()
        return resp.data

    def find_by_name_and_unit(self, household_id: str, name: str, unit: str) -> List[dict]:
        resp = self._client.table('pantry_items')\
            .select('id')\
            .eq('household_id', household_id)\
            .ilike('name', name)\
            .eq('unit', unit)\
            .execute()
        return resp.data

    def create_location(self, data: dict) -> List[dict]:
        resp = self._client.table('pantry_locations').insert(data).execute()
        return resp.data

    def update_location(self, location_id: str, data: dict) -> List[dict]:
        resp = self._client.table('pantry_locations')\
            .update(data)\
            .eq('id', location_id)\
            .execute()
        return resp.data

    def delete_locations_for_item(self, item_id: str) -> None:
        self._client.table('pantry_locations')\
            .delete()\
            .eq('pantry_item_id', item_id)\
            .execute()

    def get_locations(self, item_id: str, limit: Optional[int] = None) -> List[dict]:
        query = self._client.table('pantry_locations')\
            .select('*')\
            .eq('pantry_item_id', item_id)
        if limit:
            query = query.limit(limit)
        return query.execute().data


# ===== RECIPES =====

class SupabaseRecipeProvider(RecipeProvider):
    def __init__(self, client):
        self._client = client

    def get_all(self, household_id: str) -> List[dict]:
        resp = self._client.table('recipes')\
            .select('*')\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def get_by_id(self, recipe_id: str) -> List[dict]:
        resp = self._client.table('recipes')\
            .select('*')\
            .eq('id', recipe_id)\
            .execute()
        return resp.data

    def get_ingredients_only(self, household_id: str) -> List[dict]:
        resp = self._client.table('recipes')\
            .select('ingredients')\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def create(self, data: dict) -> List[dict]:
        resp = self._client.table('recipes').insert(data).execute()
        return resp.data

    def update(self, recipe_id: str, household_id: str, data: dict) -> List[dict]:
        resp = self._client.table('recipes').update(data)\
            .eq('id', recipe_id)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def delete(self, recipe_id: str, household_id: str) -> None:
        self._client.table('recipes')\
            .delete()\
            .eq('id', recipe_id)\
            .eq('household_id', household_id)\
            .execute()


# ===== MEAL PLANS =====

class SupabaseMealPlanProvider(MealPlanProvider):
    def __init__(self, client):
        self._client = client

    def get_upcoming(self, household_id: str, from_date: str) -> List[dict]:
        resp = self._client.table('meal_plans')\
            .select('*')\
            .eq('household_id', household_id)\
            .gte('planned_date', from_date)\
            .execute()
        return resp.data

    def get_by_id(self, meal_id: str, household_id: str) -> List[dict]:
        resp = self._client.table('meal_plans')\
            .select('*')\
            .eq('id', meal_id)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def create(self, data: dict) -> List[dict]:
        resp = self._client.table('meal_plans').insert(data).execute()
        return resp.data

    def update(self, meal_id: str, household_id: str, data: dict) -> List[dict]:
        resp = self._client.table('meal_plans').update(data)\
            .eq('id', meal_id)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def update_by_id(self, meal_id: str, data: dict) -> List[dict]:
        resp = self._client.table('meal_plans').update(data)\
            .eq('id', meal_id)\
            .execute()
        return resp.data

    def delete(self, meal_id: str, household_id: str) -> None:
        self._client.table('meal_plans')\
            .delete()\
            .eq('id', meal_id)\
            .eq('household_id', household_id)\
            .execute()


# ===== SHOPPING =====

class SupabaseShoppingProvider(ShoppingProvider):
    def __init__(self, client):
        self._client = client

    def get_manual_items(self, household_id: str) -> List[dict]:
        resp = self._client.table('shopping_list_manual')\
            .select('*')\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def create_manual_item(self, data: dict) -> List[dict]:
        resp = self._client.table('shopping_list_manual').insert(data).execute()
        return resp.data

    def update_manual_item(self, item_id: str, household_id: str, data: dict) -> List[dict]:
        resp = self._client.table('shopping_list_manual')\
            .update(data)\
            .eq('id', item_id)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def delete_manual_item(self, item_id: str, household_id: str) -> None:
        self._client.table('shopping_list_manual')\
            .delete()\
            .eq('id', item_id)\
            .eq('household_id', household_id)\
            .execute()

    def delete_checked_items(self, household_id: str) -> None:
        self._client.table('shopping_list_manual')\
            .delete()\
            .eq('household_id', household_id)\
            .eq('checked', True)\
            .execute()


# ===== SETTINGS =====

class SupabaseSettingsProvider(SettingsProvider):
    def __init__(self, client):
        self._client = client

    def get(self, household_id: str, fields: str = '*') -> List[dict]:
        resp = self._client.table('household_settings')\
            .select(fields)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def create(self, data: dict) -> List[dict]:
        resp = self._client.table('household_settings').insert(data).execute()
        return resp.data

    def update(self, household_id: str, data: dict) -> List[dict]:
        resp = self._client.table('household_settings')\
            .update(data)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data


# ===== HOUSEHOLDS =====

class SupabaseHouseholdProvider(HouseholdProvider):
    def __init__(self, client):
        self._client = client

    # --- Households ---

    def get_by_ids(self, ids: List[str], fields: str = 'id, name, created_at') -> List[dict]:
        resp = self._client.table('households')\
            .select(fields)\
            .in_('id', ids)\
            .execute()
        return resp.data

    def get_by_id_single(self, household_id: str, fields: str = 'name') -> dict:
        resp = self._client.table('households')\
            .select(fields)\
            .eq('id', household_id)\
            .single()\
            .execute()
        return resp.data

    def create(self, data: dict) -> List[dict]:
        resp = self._client.table('households').insert(data).execute()
        return resp.data

    # --- Members ---

    def get_memberships(self, user_id: str, fields: str = 'household_id') -> List[dict]:
        resp = self._client.table('household_members')\
            .select(fields)\
            .eq('user_id', user_id)\
            .execute()
        return resp.data

    def get_first_membership(self, user_id: str) -> List[dict]:
        resp = self._client.table('household_members')\
            .select('household_id')\
            .eq('user_id', user_id)\
            .limit(1)\
            .execute()
        return resp.data

    def get_members(self, household_id: str, fields: str = 'user_id, role, created_at') -> List[dict]:
        resp = self._client.table('household_members')\
            .select(fields)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def check_membership(self, user_id: str, household_id: str) -> List[dict]:
        resp = self._client.table('household_members')\
            .select('id')\
            .eq('user_id', user_id)\
            .eq('household_id', household_id)\
            .execute()
        return resp.data

    def check_membership_with_role(self, household_id: str, user_id: str) -> List[dict]:
        resp = self._client.table('household_members')\
            .select('id, role')\
            .eq('household_id', household_id)\
            .eq('user_id', user_id)\
            .execute()
        return resp.data

    def add_member(self, data: dict) -> List[dict]:
        resp = self._client.table('household_members').insert(data).execute()
        return resp.data

    def remove_member(self, household_id: str, user_id: str) -> None:
        self._client.table('household_members')\
            .delete()\
            .eq('household_id', household_id)\
            .eq('user_id', user_id)\
            .execute()

    # --- Invites ---

    def create_invite(self, data: dict) -> List[dict]:
        resp = self._client.table('household_invites').insert(data).execute()
        return resp.data

    def get_active_invite(self, household_id: str, now_iso: str) -> List[dict]:
        resp = self._client.table('household_invites')\
            .select('code, expires_at, created_at')\
            .eq('household_id', household_id)\
            .is_('used_by', 'null')\
            .gte('expires_at', now_iso)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        return resp.data

    def find_valid_invite(self, code: str, now_iso: str) -> List[dict]:
        resp = self._client.table('household_invites')\
            .select('id, household_id, role')\
            .eq('code', code)\
            .is_('used_by', 'null')\
            .gte('expires_at', now_iso)\
            .execute()
        return resp.data

    def mark_invite_used(self, invite_id: str, data: dict) -> None:
        self._client.table('household_invites')\
            .update(data)\
            .eq('id', invite_id)\
            .execute()


# ===== MAIN PROVIDER =====

class SupabaseDatabaseProvider(DatabaseProvider):
    """Supabase implementation — wraps all existing Supabase SDK calls."""

    def __init__(self, client):
        self._auth = SupabaseAuthProvider(client)
        self._pantry = SupabasePantryProvider(client)
        self._recipes = SupabaseRecipeProvider(client)
        self._meal_plans = SupabaseMealPlanProvider(client)
        self._shopping = SupabaseShoppingProvider(client)
        self._settings = SupabaseSettingsProvider(client)
        self._households = SupabaseHouseholdProvider(client)

    @property
    def auth(self):
        return self._auth

    @property
    def pantry(self):
        return self._pantry

    @property
    def recipes(self):
        return self._recipes

    @property
    def meal_plans(self):
        return self._meal_plans

    @property
    def shopping(self):
        return self._shopping

    @property
    def settings(self):
        return self._settings

    @property
    def households(self):
        return self._households
