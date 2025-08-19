from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .organizations_table import Organization


class OrganizationsInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, organization: Organization) -> Organization:
        self.session.add(organization)
        return organization

    async def get_by_id(self, id: UUID | str) -> Organization | None:
        return await self.session.scalar(select(Organization).where(Organization.id == id))

    async def list_by_owner(self, owner_user_id: UUID | str) -> list[Organization]:
        rows = await self.session.scalars(
            select(Organization).where(Organization.owner_user_id == owner_user_id)
        )
        return list(rows.all())
