"""
Authentication Routes - Python Age 5.0

Proxy to Supabase auth (keeping what works!)
"""

from fastapi import APIRouter, HTTPException, status, Header, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import logging
import secrets
from datetime import datetime, timezone, timedelta
import httpx
from slowapi import Limiter
from slowapi.util import get_remote_address
from gotrue.errors import AuthApiError
from db import get_db

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
@limiter.limit("3/hour")
async def signup(credentials: SignUpRequest, request: Request):
    """
    Create new user account and household.
    """
    db = get_db()

    try:
        # Create user
        auth_result = db.auth.sign_up(credentials.email, credentials.password)

        if not auth_result.get('user'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )

        user = auth_result['user']

        # IMPORTANT: sign_up changes the Supabase client's auth context to the
        # new user's JWT. Restore service-role auth so subsequent table operations
        # (household creation, member addition) have full permissions via RLS bypass.
        from utils.supabase_client import get_supabase
        service_key = os.getenv("SUPABASE_SERVICE_KEY")
        get_supabase().postgrest.auth(service_key)

        # Create household for user
        household_data = db.households.create({
            'name': f"{credentials.email.split('@')[0]}'s Household",
            'created_by': user['id']
        })

        household_id = household_data[0]['id']

        # Add user to household
        db.households.add_member({
            'household_id': household_id,
            'user_id': user['id'],
            'role': 'owner'
        })

        # Create user profile with a quick access code
        from utils.supabase_client import get_supabase as _gs
        _sb = _gs()
        try:
            code_resp = _sb.rpc("generate_quick_access_code").execute()
            initial_code = (code_resp.data or '').upper()
        except Exception:
            initial_code = None

        if initial_code:
            _sb.table("user_profiles").upsert({
                "user_id": user['id'],
                "quick_access_code": initial_code,
                "qa_failed_attempts": 0,
            }).execute()

        return {
            "user": {
                "id": user['id'],
                "email": user['email']
            },
            "household_id": household_id,
            "session": auth_result.get('session')
        }

    except HTTPException:
        raise
    except AuthApiError as e:
        # Surface Supabase auth errors directly (e.g. "User already registered")
        logger.warning(f"Signup auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create account. Please try again."
        )


@router.post("/signin")
@limiter.limit("10/minute")
async def signin(credentials: SignInRequest, request: Request):
    """
    Sign in existing user.
    """
    db = get_db()

    try:
        auth_result = db.auth.sign_in_with_password(credentials.email, credentials.password)

        if not auth_result.get('user'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = auth_result['user']

        # Restore service-role auth for table queries (sign_in changes client context)
        from utils.supabase_client import get_supabase
        service_key = os.getenv("SUPABASE_SERVICE_KEY")
        get_supabase().postgrest.auth(service_key)

        # Get user's household
        memberships = db.households.get_memberships(user['id'])
        household_id = memberships[0]['household_id'] if memberships else None

        return {
            "user": {
                "id": user['id'],
                "email": user['email']
            },
            "household_id": household_id,
            "session": auth_result.get('session')
        }

    except AuthApiError as e:
        logger.warning(f"Signin auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Signin failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


class QuickAccessRequest(BaseModel):
    code: str
    # First-time use: email + password required to verify identity
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    # Returning use: trusted device token replaces email/password
    device_token: Optional[str] = None


# ------------------------------------------------------------------ #
#  Helpers                                                             #
# ------------------------------------------------------------------ #

def _restore_service_role():
    from utils.supabase_client import get_supabase
    key = os.getenv("SUPABASE_SERVICE_KEY")
    get_supabase().postgrest.auth(key)


# Redis key for storing QA refresh tokens (used by returning-device flow)
def _qa_rt_key(user_id: str) -> str:
    return f"qa_rt:{user_id}"


def _store_qa_refresh_token(user_id: str, refresh_token: str) -> None:
    """Persist refresh token in Redis for 60 days (returning device QA flow)."""
    try:
        from state_manager import redis_client
        if redis_client:
            redis_client.setex(_qa_rt_key(user_id), 60 * 24 * 3600, refresh_token)
    except Exception as e:
        logger.warning(f"Could not cache QA refresh token in Redis: {e}")


def _get_qa_refresh_token(user_id: str) -> Optional[str]:
    """Retrieve cached refresh token from Redis."""
    try:
        from state_manager import redis_client
        if redis_client:
            val = redis_client.get(_qa_rt_key(user_id))
            return val.decode() if val else None
    except Exception as e:
        logger.warning(f"Could not retrieve QA refresh token from Redis: {e}")
    return None


# ------------------------------------------------------------------ #
#  Quick Access endpoints                                              #
# ------------------------------------------------------------------ #

@router.post("/quickaccess")
@limiter.limit("5/minute")
async def quick_access(body: QuickAccessRequest, request: Request):
    """
    Sign in via a 5-char quick access code.

    First-time on a device  → requires code + email + password.
                              On success, returns a device_token to store
                              in localStorage for future logins.

    Returning device        → requires code + device_token.
                              On success, returns a fresh session.

    Server-side enforces 2 failed attempts before a 30-minute lockout.
    Generic error messages are used throughout to prevent enumeration.
    """
    from utils.supabase_client import get_supabase
    db = get_db()
    sb = get_supabase()
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    AUTH_FAILED = "Invalid access code or credentials"
    LOCKED_MSG  = "Too many failed attempts. Please use Password Access or try again in 30 minutes."

    # 1. Look up code — normalize to uppercase for case-insensitive match
    code = body.code.strip().upper()
    profile_resp = sb.table("user_profiles") \
        .select("user_id, qa_failed_attempts, qa_locked_until") \
        .eq("quick_access_code", code) \
        .execute()

    if not profile_resp.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_FAILED)

    p = profile_resp.data[0]
    user_id = p["user_id"]

    # 2. Check lockout
    if p.get("qa_locked_until"):
        locked_until = datetime.fromisoformat(p["qa_locked_until"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) < locked_until:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=LOCKED_MSG)

    def record_failure():
        new_attempts = p["qa_failed_attempts"] + 1
        update = {"qa_failed_attempts": new_attempts}
        if new_attempts >= 2:
            update["qa_locked_until"] = (
                datetime.now(timezone.utc) + timedelta(minutes=30)
            ).isoformat()
        sb.table("user_profiles").update(update).eq("user_id", user_id).execute()

    def reset_attempts():
        sb.table("user_profiles") \
            .update({"qa_failed_attempts": 0, "qa_locked_until": None}) \
            .eq("user_id", user_id) \
            .execute()

    # ----------------------------------------------------------------
    # RETURNING FLOW — device token provided
    # ----------------------------------------------------------------
    if body.device_token:
        token_resp = sb.table("device_tokens") \
            .select("id, user_id, expires_at") \
            .eq("token", body.device_token) \
            .execute()

        token_row = token_resp.data[0] if token_resp.data else None
        if not token_row or token_row["user_id"] != user_id:
            record_failure()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_FAILED)

        expires = datetime.fromisoformat(token_row["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) >= expires:
            record_failure()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_FAILED)

        # Mark device token as used
        sb.table("device_tokens") \
            .update({"last_used_at": datetime.now(timezone.utc).isoformat()}) \
            .eq("id", token_row["id"]) \
            .execute()

        # Refresh the Supabase session using the stored refresh token
        stored_rt = _get_qa_refresh_token(user_id)
        if not stored_rt:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Device token verified but session has expired — please use Password Access to re-authorise this device."
            )

        try:
            refreshed = db.auth.refresh_session(stored_rt)
        except Exception as e:
            logger.warning(f"QA refresh_session failed for {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session could not be refreshed — please use Password Access to re-authorise this device."
            )

        new_session = refreshed.get("session") or refreshed
        new_rt = new_session.get("refresh_token") or stored_rt
        # Keep Redis up to date with the rotated refresh token
        _store_qa_refresh_token(user_id, new_rt)

        reset_attempts()
        _restore_service_role()

        memberships = db.households.get_memberships(user_id)
        household_id = memberships[0]["household_id"] if memberships else None

        return {
            "session": {
                "access_token":  new_session.get("access_token"),
                "refresh_token": new_rt,
            },
            "household_id": household_id,
            "device_token": body.device_token,
        }

    # ----------------------------------------------------------------
    # FIRST-TIME FLOW — email + password required
    # ----------------------------------------------------------------
    if not body.email or not body.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required for first-time access"
        )

    try:
        auth_result = db.auth.sign_in_with_password(body.email, body.password)
    except AuthApiError:
        record_failure()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_FAILED)

    if not auth_result.get("user"):
        record_failure()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_FAILED)

    # Restore service role immediately after sign_in alters auth context
    _restore_service_role()

    # Verify the signed-in user actually owns this code (anti-enumeration)
    if auth_result["user"]["id"] != user_id:
        record_failure()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=AUTH_FAILED)

    # Issue a device token for this browser
    device_token = secrets.token_urlsafe(48)
    sb.table("device_tokens").insert({
        "user_id": user_id,
        "token":   device_token,
    }).execute()

    # Cache the refresh token in Redis so the returning-device flow can
    # refresh the session without the (blocked) GoTrue admin API
    first_session = auth_result.get("session") or {}
    if first_session.get("refresh_token"):
        _store_qa_refresh_token(user_id, first_session["refresh_token"])

    reset_attempts()
    _restore_service_role()

    memberships = db.households.get_memberships(user_id)
    household_id = memberships[0]["household_id"] if memberships else None

    return {
        "session":      auth_result.get("session"),
        "household_id": household_id,
        "device_token": device_token,
        "first_time":   True,
    }


@router.get("/my-code")
async def get_my_code(authorization: Optional[str] = Header(None)):
    """Return the authenticated user's quick access code."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization")

    token = authorization.replace("Bearer ", "")
    db = get_db()
    from utils.supabase_client import get_supabase
    sb = get_supabase()

    user_result = db.auth.get_user(token)
    if not user_result or not user_result.get("user"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = user_result["user"]["id"]

    profile = sb.table("user_profiles") \
        .select("quick_access_code") \
        .eq("user_id", user_id) \
        .execute()

    # Auto-create profile for accounts that predate the quick-access feature
    if not profile.data or not profile.data[0].get("quick_access_code"):
        code_resp = sb.rpc("generate_quick_access_code").execute()
        new_code = (code_resp.data or '').upper()
        sb.table("user_profiles").upsert({
            "user_id": user_id,
            "quick_access_code": new_code,
            "qa_failed_attempts": 0,
        }).execute()
        return {"quick_access_code": new_code}

    return {"quick_access_code": profile.data[0]["quick_access_code"]}


@router.post("/regenerate-code")
async def regenerate_code(authorization: Optional[str] = Header(None)):
    """
    Generate a new quick access code for the authenticated user and
    invalidate all existing device tokens (all trusted browsers must
    re-verify with email + password on next quick access login).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization")

    token = authorization.replace("Bearer ", "")
    db = get_db()
    from utils.supabase_client import get_supabase
    sb = get_supabase()

    user_result = db.auth.get_user(token)
    if not user_result or not user_result.get("user"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = user_result["user"]["id"]

    # Call the Postgres function to generate a collision-free code
    new_code_resp = sb.rpc("generate_quick_access_code").execute()
    new_code = (new_code_resp.data or '').upper()

    # UPSERT so this also works for accounts created before user_profiles existed
    sb.table("user_profiles").upsert({
        "user_id":            user_id,
        "quick_access_code":  new_code,
        "qa_failed_attempts": 0,
        "qa_locked_until":    None,
    }).execute()

    # Revoke all trusted devices and clear the QA Redis RT
    sb.table("device_tokens").delete().eq("user_id", user_id).execute()
    try:
        from state_manager import redis_client as _rc
        if _rc:
            _rc.delete(_qa_rt_key(user_id))
    except Exception:
        pass

    return {
        "quick_access_code": new_code,
        "message": "Code regenerated. All trusted devices have been removed.",
    }


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh_token(body: RefreshRequest, request: Request):
    """
    Refresh an expired access token using a refresh token.
    Returns new access_token and refresh_token.
    """
    db = get_db()

    try:
        result = db.auth.refresh_session(body.refresh_token)

        if not result.get('session'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalid or expired"
            )

        session = result['session']

        # Keep the QA Redis RT fresh so returning-device QA logins survive
        # intermediate token rotations triggered by api.js auto-refresh
        new_rt = session.get('refresh_token')
        user_id = (result.get('user') or {}).get('id')
        if user_id and new_rt:
            _store_qa_refresh_token(user_id, new_rt)

        return {
            "access_token": session['access_token'],
            "refresh_token": session['refresh_token'],
            "expires_in": session['expires_in']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )


class SignoutRequest(BaseModel):
    refresh_token: Optional[str] = None


@router.post("/signout")
async def signout(authorization: Optional[str] = Header(None), body: Optional[SignoutRequest] = None):
    """
    Sign out current user.

    Accepts the current refresh_token in the body so we can pre-rotate it:
    the new RT is cached in Redis for future QA logins, then the original
    session is revoked via GoTrue scope=local (leaving the new RT alive).
    This ensures QA returning-device logins survive logout.
    """
    at_client = authorization.replace("Bearer ", "").strip() if authorization and authorization.startswith("Bearer ") else None
    rt_client = (body.refresh_token or "").strip() if body else None
    db = get_db()

    # Pre-rotate: create a spare refresh token that is NOT part of the session
    # we're about to revoke. Store it in Redis for future QA logins.
    if at_client and rt_client:
        try:
            user_result = db.auth.get_user(at_client)
            user_id = (user_result.get("user") or {}).get("id")
            if user_id:
                rotated = db.auth.refresh_session(rt_client)
                spare_rt = (rotated.get("session") or rotated).get("refresh_token")
                if spare_rt:
                    _store_qa_refresh_token(user_id, spare_rt)
                    _restore_service_role()
        except Exception as e:
            logger.debug(f"Pre-rotation on signout failed (non-fatal): {e}")

    # Sign out the ORIGINAL session using the client's access token directly
    # via GoTrue HTTP so we don't accidentally revoke the spare session.
    try:
        supabase_url = os.getenv("SUPABASE_URL", "")
        service_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        if at_client and supabase_url:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{supabase_url}/auth/v1/logout?scope=local",
                    headers={
                        "apikey": service_key,
                        "Authorization": f"Bearer {at_client}",
                    },
                )
        else:
            db.auth.sign_out()
    except Exception as e:
        logger.warning(f"Signout revocation failed (non-fatal): {e}")

    return {"message": "Signed out successfully"}


@router.get("/me")
async def get_current_user_info(authorization: Optional[str] = Header(None)):
    """
    Get current user information from JWT token.
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )

    token = authorization.replace('Bearer ', '')
    db = get_db()

    try:
        # Verify token and get user
        user_result = db.auth.get_user(token)

        if not user_result or not user_result.get('user'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user = user_result['user']

        # Get household
        memberships = db.households.get_memberships(user['id'])
        household_id = memberships[0]['household_id'] if memberships else None

        return {
            "user": {
                "id": user['id'],
                "email": user['email']
            },
            "household_id": household_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
