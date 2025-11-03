from uuid import UUID

from database.relational_db import UoW, User, Organization, OrganizationsInterface, OrgMembership
from domain.organizations import MembershipRole


class OrganizationService:
    def __init__(self, uow: UoW, org_repo: OrganizationsInterface):
        self.uow = uow
        self.org_repo = org_repo

    async def create_organization(
        self, 
        owner: User, 
        country_code: str, 
        name: str
    ) -> Organization:
        organization = Organization(
            name=name,
            country=country_code,
            owner_user_id=owner.id,
            # Initialize Stripe onboarding defaults
            stripe_account_id=None,
        )

        await self.org_repo.add(organization)
        await self.uow.session.flush()
        await self.org_repo.ensure_membership(
            organization.id,
            owner.id,
            MembershipRole.OWNER,
        )
        await self.uow.commit()
        await self.uow.session.refresh(organization)
        return organization

    async def get_organization(self, organization_id: UUID | str) -> Organization | None:
        return await self.org_repo.get_by_id(organization_id)
    
    async def get_by_stripe_account_id(self, stripe_account_id: str) -> Organization | None:
        return await self.org_repo.get_by_stripe_account_id(stripe_account_id)

    async def list_my(self, owner: User) -> list[Organization]:
        return await self.org_repo.list_by_owner(owner.id)
    
    async def get_my_membership(self, org_id: UUID | str, user: User) -> OrgMembership | None:
        return await self.org_repo.get_membership(org_id, user.id)
    
    async def list_mine(self, user: User) -> list[Organization]:
        return await self.org_repo.list_for_user(user.id)
