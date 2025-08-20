from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .organizations_table import Organization
from domain.organizations.enums import KycStatus


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

    async def get_by_stripe_account_id(self, stripe_account_id: str) -> Organization | None:
        return await self.session.scalar(
            select(Organization).where(Organization.stripe_account_id == stripe_account_id)
        )

    async def update_fields(self, org_id: UUID | str, **updates) -> None:
        org = await self.get_by_id(org_id)
        if org is None:
            return
        for key, value in updates.items():
            setattr(org, key, value)
        await self.session.flush()

    async def mark_deauthorized(self, account_id: str) -> None:
        org = await self.get_by_stripe_account_id(account_id)
        if org is None:
            return
        org.kyc_status = KycStatus.PENDING
        await self.session.flush()
