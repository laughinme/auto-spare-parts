from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from database.relational_db import User
from domain.organizations import OrganizationModel
from core.security import auth_user
from service.organizations import OrganizationService, get_organization_service

router = APIRouter()


@router.get(
    path='/',
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
