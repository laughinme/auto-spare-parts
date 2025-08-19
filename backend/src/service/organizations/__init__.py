from fastapi import Depends

from database.relational_db import UoW, get_uow
from database.relational_db.tables.organizations.organizations_interface import OrganizationsInterface
from .organization_service import OrganizationService


async def get_organization_service(
    uow: UoW = Depends(get_uow),
) -> OrganizationService:
    org_repo = OrganizationsInterface(uow.session)
    return OrganizationService(uow, org_repo)
