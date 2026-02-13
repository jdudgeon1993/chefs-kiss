"""
Database Provider Factory - Chef's Kiss

Swap database backends without changing any route or business logic code.
Currently uses Supabase. Future: direct PostgreSQL, SQLite, etc.
"""

from db.provider import DatabaseProvider

_provider = None


def get_db() -> DatabaseProvider:
    """
    Get the database provider singleton.

    Currently uses Supabase. To switch providers,
    change the implementation here.
    """
    global _provider
    if _provider is None:
        from db.supabase_provider import SupabaseDatabaseProvider
        from utils.supabase_client import get_supabase
        _provider = SupabaseDatabaseProvider(get_supabase())
    return _provider
