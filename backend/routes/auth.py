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

        # Create household for user
        household_data = db.households.create({
            'name': f"{credentials.email.split('@')[0]}'s Household",
            'owner_id': user['id']
        })

        household_id = household_data[0]['id']

        # Add user to household
        db.households.add_member({
            'household_id': household_id,
            'user_id': user['id'],
            'role': 'owner'
        })

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

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


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


@router.post("/signout")
async def signout():
    """
    Sign out current user.
    """
    db = get_db()

    try:
        db.auth.sign_out()
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
