from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from database.relational_db import User
from domain.organizations import OrganizationModel
from core.security import auth_user
from service.organizations import OrganizationService, get_organization_service


router = APIRouter()


@router.get(
    path='/{organization_id}',
    response_model=OrganizationModel,
    summary='Get organization by ID'
)
async def get_organization(
    organization_id: UUID,
    svc: Annotated[OrganizationService, Depends(get_organization_service)],
):
    org = await svc.get_by_id(organization_id)
    if org is None:
        raise HTTPException(status_code=404, detail='Organization not found')
    return org


@router.get(
    path='/my',
    response_model=list[OrganizationModel],
    summary='List my organizations'
)
async def list_my_organizations(
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[OrganizationService, Depends(get_organization_service)],
):
    return await svc.list_my(user)
