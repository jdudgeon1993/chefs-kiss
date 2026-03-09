"""
Ingredient Normalization — Python Age 5.0

Normalizes ingredient names and units so the pipeline matches
"chicken breasts" to "chicken breast" and "oz" to "ounce".
"""

# Unit alias map — maps common abbreviations to canonical form
UNIT_ALIASES = {
    # Weight
    "oz": "ounce",
    "ounces": "ounce",
    "lb": "pound",
    "lbs": "pound",
    "pounds": "pound",
    "g": "gram",
    "grams": "gram",
    "kg": "kilogram",
    "kilograms": "kilogram",
    # Volume
    "tsp": "teaspoon",
    "teaspoons": "teaspoon",
    "tbsp": "tablespoon",
    "tbs": "tablespoon",
    "tablespoons": "tablespoon",
    "c": "cup",
    "cups": "cup",
    "pt": "pint",
    "pints": "pint",
    "qt": "quart",
    "quarts": "quart",
    "gal": "gallon",
    "gallons": "gallon",
    "ml": "milliliter",
    "milliliters": "milliliter",
    "l": "liter",
    "liters": "liter",
    # Count
    "ea": "each",
    "pc": "piece",
    "pcs": "piece",
    "pieces": "piece",
    "doz": "dozen",
    "dozens": "dozen",
    # Other
    "pkg": "package",
    "packages": "package",
    "cans": "can",
    "bottles": "bottle",
    "bunches": "bunch",
    "cloves": "clove",
    "slices": "slice",
    "stalks": "stalk",
    "sprigs": "sprig",
    "heads": "head",
    "bags": "bag",
    "boxes": "box",
    "jars": "jar",
}


def normalize_unit(unit: str) -> str:
    """Normalize a unit string to its canonical form."""
    lower = unit.strip().lower()
    return UNIT_ALIASES.get(lower, lower)


def normalize_name(name: str) -> str:
    """Normalize an ingredient name.

    Simple plural stripping: if a name ends in 's' (but not 'ss'),
    remove the trailing 's'. This catches "chicken breasts" -> "chicken breast",
    "tomatoes" -> "tomatoe" -> handled by both sides normalizing the same way.
    """
    lower = name.strip().lower()

    # Strip simple trailing 's' plural (skip words ending in 'ss' like "grass")
    if len(lower) > 3 and lower.endswith('s') and not lower.endswith('ss'):
        # Handle "ies" -> "y" (e.g. "berries" -> "berry")
        if lower.endswith('ies'):
            lower = lower[:-3] + 'y'
        # Handle "oes" -> "o" (e.g. "tomatoes" -> "tomato", "potatoes" -> "potato")
        elif lower.endswith('oes'):
            lower = lower[:-2]
        # Handle "ves" -> "f" (e.g. "loaves" -> "loaf")
        elif lower.endswith('ves'):
            lower = lower[:-3] + 'f'
        # Standard: just drop the 's' (e.g. "breasts" -> "breast")
        else:
            lower = lower[:-1]

    return lower


def normalize_ingredient(name: str, unit: str) -> tuple:
    """Return a normalized (name, unit) tuple for consistent matching."""
    return (normalize_name(name), normalize_unit(unit))


def normalize_key(name: str, unit: str) -> str:
    """Return a normalized 'name|unit' key string for consistent matching."""
    n, u = normalize_ingredient(name, unit)
    return f"{n}|{u}"
