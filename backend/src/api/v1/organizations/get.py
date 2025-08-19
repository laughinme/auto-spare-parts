from typing import Annotated
from fastapi import APIRouter, Depends

from database.relational_db import User
from domain.organizations import OrganizationModel
from core.security import auth_user
from service.organizations import OrganizationService, get_organization_service

router = APIRouter()

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
