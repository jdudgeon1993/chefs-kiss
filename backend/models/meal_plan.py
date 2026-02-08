"""
Meal Plan Models - Python Age 5.0
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class MealPlan(BaseModel):
    """Meal planned for a specific date"""
    id: str
    household_id: str
    date: date
    recipe_id: str
    serving_multiplier: float = 1.0
    cooked: bool = False

    @classmethod
    def from_supabase(cls, meal_data: dict):
        """Convert Supabase data to model.

        Handles both DB column names (planned_date, is_cooked) and
        model field names (date, cooked).
        """
        # DB uses planned_date, model uses date
        raw_date = meal_data.get('date') or meal_data.get('planned_date')
        parsed_date = raw_date if isinstance(raw_date, date) else date.fromisoformat(str(raw_date))

        # DB uses is_cooked, model uses cooked
        cooked = meal_data.get('cooked') if 'cooked' in meal_data else meal_data.get('is_cooked', False)

        return cls(
            id=meal_data['id'],
            household_id=meal_data['household_id'],
            date=parsed_date,
            recipe_id=meal_data['recipe_id'],
            serving_multiplier=meal_data.get('serving_multiplier', 1.0),
            cooked=cooked or False
        )


class MealPlanCreate(BaseModel):
    """Create new meal plan"""
    date: date
    recipe_id: str
    serving_multiplier: float = Field(default=1.0, gt=0, le=10)

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2024-12-25",
                "recipe_id": "550e8400-e29b-41d4-a716-446655440000",
                "serving_multiplier": 1.5
            }
        }


class MealPlanUpdate(BaseModel):
    """Update existing meal plan"""
    date: Optional[date] = None
    recipe_id: Optional[str] = None
    serving_multiplier: Optional[float] = Field(None, gt=0, le=10)
    cooked: Optional[bool] = None
