"""
Authentication Routes - Python Age 5.0

Proxy to Supabase auth (keeping what works!)
"""

from fastapi import APIRouter, HTTPException, status, Header, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.supabase_client import get_supabase

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
async def signup(request: SignUpRequest, req: Request):
    """
    Create new user account and household.
    """
    supabase = get_supabase()

    try:
        # Create user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )

        user = auth_response.user

        # Create household for user
        household_response = supabase.table('households').insert({
            'name': f"{request.email.split('@')[0]}'s Household",
            'owner_id': user.id
        }).execute()

        household_id = household_response.data[0]['id']

        # Add user to household
        supabase.table('household_members').insert({
            'household_id': household_id,
            'user_id': user.id,
            'role': 'owner'
        }).execute()

        return {
            "user": {
                "id": user.id,
                "email": user.email
            },
            "household_id": household_id,
            "session": auth_response.session.model_dump() if auth_response.session else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create account. Please try again."
        )


@router.post("/signin")
@limiter.limit("10/minute")
async def signin(request: SignInRequest, req: Request):
    """
    Sign in existing user.
    """
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = auth_response.user

        # Get user's household
        household_response = supabase.table('household_members')\
            .select('household_id')\
            .eq('user_id', user.id)\
            .execute()

        household_id = household_response.data[0]['household_id'] if household_response.data else None

        return {
            "user": {
                "id": user.id,
                "email": user.email
            },
            "household_id": household_id,
            "session": auth_response.session.model_dump() if auth_response.session else None
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh_token(request: RefreshRequest, req: Request):
    """
    Refresh an expired access token using a refresh token.
    Returns new access_token and refresh_token.
    """
    supabase = get_supabase()

    try:
        response = supabase.auth.refresh_session(request.refresh_token)

        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalid or expired"
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "expires_in": response.session.expires_in
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )


@router.post("/signout")
async def signout():
    """
    Sign out current user.
    """
    supabase = get_supabase()

    try:
        supabase.auth.sign_out()
        return {"message": "Signed out successfully"}
    except Exception as e:
        logger.error(f"Signout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to sign out"
        )


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
    supabase = get_supabase()

    try:
        # Verify token and get user
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user = user_response.user

        # Get household
        household_response = supabase.table('household_members')\
            .select('household_id')\
            .eq('user_id', user.id)\
            .execute()

        household_id = household_response.data[0]['household_id'] if household_response.data else None

        return {
            "user": {
                "id": user.id,
                "email": user.email
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
