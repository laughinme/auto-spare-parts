from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from database.relational_db import User
from domain.organizations import OrgMembershipModel
from core.security import auth_user
from service.organizations import OrganizationService, get_organization_service

router = APIRouter()


@router.get(
    path='/me',
    response_model=OrgMembershipModel,
    summary="Get current user's position in the organization",
    tags=['New'], # TODO: Remove this once developers have migrated to the new endpoint
)
async def get_my_position(
    org_id: UUID,
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[OrganizationService, Depends(get_organization_service)],
):
    membership = await svc.get_my_membership(org_id, user)
    if membership is None:
        raise HTTPException(status_code=404, detail="User is not a member of this organization")
    
    return membership
