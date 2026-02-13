"""
Household Management Routes - Invite, Members, Switching

Supports multi-household membership:
- Every user owns their own household (created at signup)
- Users can join additional households via invite codes
- Active household is selected per-request via X-Household-Id header
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
import secrets
from datetime import datetime, timedelta, timezone

from db import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/api/households", tags=["households"])


class InviteRequest(BaseModel):
    expires_hours: int = 48


class AcceptInviteRequest(BaseModel):
    code: str


class SwitchHouseholdRequest(BaseModel):
    household_id: str


# ===== HOUSEHOLD LIST =====

@router.get("/")
async def list_my_households(user: dict = Depends(get_current_user)):
    """List all households the current user belongs to."""
    db = get_db()

    memberships = db.households.get_memberships(user['id'], 'household_id, role')

    if not memberships:
        return {"households": []}

    household_ids = [m['household_id'] for m in memberships]

    households = db.households.get_by_ids(household_ids)

    # Merge role info
    role_map = {m['household_id']: m['role'] for m in memberships}
    result = []
    for h in households:
        result.append({
            "id": h['id'],
            "name": h['name'],
            "created_at": h['created_at'],
            "role": role_map.get(h['id'], 'member')
        })

    return {"households": result}


# ===== MEMBERS =====

@router.get("/members")
async def list_members(
    user: dict = Depends(get_current_user),
    household_id: Optional[str] = None
):
    """List all members of a household."""
    db = get_db()

    # Resolve household
    hid = household_id or _get_user_household(db, user['id'])
    if not hid:
        raise HTTPException(status_code=404, detail="No household found")

    # Verify caller is a member
    _verify_membership(db, user['id'], hid)

    members = db.households.get_members(hid)

    result = []
    for m in members:
        member_info = {
            "user_id": m['user_id'],
            "role": m['role'],
            "joined_at": m['created_at'],
            "is_you": m['user_id'] == user['id']
        }
        result.append(member_info)

    return {
        "household_id": hid,
        "members": result,
        "count": len(result)
    }


# ===== INVITE =====

@router.post("/invite")
async def create_invite(
    request: InviteRequest,
    user: dict = Depends(get_current_user),
    household_id: Optional[str] = None
):
    """Generate an invite code for the current household."""
    db = get_db()

    hid = household_id or _get_user_household(db, user['id'])
    if not hid:
        raise HTTPException(status_code=404, detail="No household found")

    _verify_membership(db, user['id'], hid)

    # Generate a short, readable code (8 chars uppercase alphanumeric)
    code = secrets.token_hex(4).upper()

    expires_at = datetime.now(timezone.utc) + timedelta(hours=request.expires_hours)

    db.households.create_invite({
        'household_id': hid,
        'code': code,
        'expires_at': expires_at.isoformat(),
        'created_by': user['id'],
        'role': 'member'
    })

    return {
        "code": code,
        "expires_at": expires_at.isoformat(),
        "expires_hours": request.expires_hours
    }


@router.get("/invite")
async def get_active_invite(user: dict = Depends(get_current_user)):
    """Get the active (unused, unexpired) invite for the user's household."""
    db = get_db()

    hid = _get_user_household(db, user['id'])
    if not hid:
        raise HTTPException(status_code=404, detail="No household found")

    now = datetime.now(timezone.utc).isoformat()

    invites = db.households.get_active_invite(hid, now)

    if not invites:
        return {"invite": None}

    return {"invite": invites[0]}


@router.post("/invite/accept")
async def accept_invite(
    request: AcceptInviteRequest,
    user: dict = Depends(get_current_user)
):
    """Accept an invite code and join the household."""
    db = get_db()
    code = request.code.strip().upper()

    now = datetime.now(timezone.utc).isoformat()

    # Find valid invite
    invite_results = db.households.find_valid_invite(code, now)

    if not invite_results:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired invite code"
        )

    invite_data = invite_results[0]
    target_household = invite_data['household_id']
    role = invite_data['role'] or 'member'

    # Check if already a member
    existing = db.households.check_membership(user['id'], target_household)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You are already a member of this household"
        )

    # Add user to household
    db.households.add_member({
        'household_id': target_household,
        'user_id': user['id'],
        'role': role
    })

    # Mark invite as used
    db.households.mark_invite_used(invite_data['id'], {
        'used_by': user['id'],
        'used_at': datetime.now(timezone.utc).isoformat()
    })

    # Get household name
    household = db.households.get_by_id_single(target_household)

    return {
        "message": f"Joined '{household['name']}' successfully",
        "household_id": target_household,
        "household_name": household['name'],
        "role": role
    }


# ===== LEAVE =====

@router.post("/leave")
async def leave_household(
    request: SwitchHouseholdRequest,
    user: dict = Depends(get_current_user)
):
    """Leave a household. Owners cannot leave their own household."""
    db = get_db()

    # Check membership and role
    membership = db.households.check_membership_with_role(request.household_id, user['id'])

    if not membership:
        raise HTTPException(status_code=404, detail="Not a member of this household")

    if membership[0]['role'] == 'owner':
        raise HTTPException(
            status_code=400,
            detail="Owners cannot leave their own household. Transfer ownership first."
        )

    # Remove membership
    db.households.remove_member(request.household_id, user['id'])

    return {"message": "Left household successfully"}


# ===== HELPERS =====

def _get_user_household(db, user_id: str) -> Optional[str]:
    """Get the first household for a user."""
    memberships = db.households.get_first_membership(user_id)
    return memberships[0]['household_id'] if memberships else None


def _verify_membership(db, user_id: str, household_id: str):
    """Verify a user is a member of a household."""
    check = db.households.check_membership(user_id, household_id)
    if not check:
        raise HTTPException(status_code=403, detail="Not a member of this household")
