from uuid import UUID

from database.relational_db import UoW, User, Organization, OrganizationsInterface
from domain.organizations import OrganizationCreate


class OrganizationService:
    def __init__(self, uow: UoW, org_repo: OrganizationsInterface):
        self.uow = uow
        self.org_repo = org_repo

    async def create_organization(self, payload: OrganizationCreate, owner: User) -> Organization:
        organization = Organization(
            name=payload.name,
            country=payload.country,
            address=payload.address,
            owner_user_id=owner.id,
            payout_schedule=payload.payout_schedule,
        )

        await self.org_repo.add(organization)
        await self.uow.commit()
        await self.uow.session.refresh(organization)
        return organization

    async def get_by_id(self, organization_id: UUID | str) -> Organization | None:
        return await self.org_repo.get_by_id(organization_id)

    async def list_my(self, owner: User) -> list[Organization]:
        return await self.org_repo.list_by_owner(owner.id)
