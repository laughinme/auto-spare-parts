from typing import Annotated
from fastapi import APIRouter, Depends

from database.relational_db import User
from domain.organizations import OrganizationModel, OrganizationCreate
from core.security import auth_user
from service.organizations import OrganizationService, get_organization_service

router = APIRouter()

@router.post(
    path='/',
    response_model=OrganizationModel,
    summary='Create a new organization',
    include_in_schema=False,
)
async def create_organization(
    payload: OrganizationCreate,
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[OrganizationService, Depends(get_organization_service)],
):
    return await svc.create_organization(payload, user)
