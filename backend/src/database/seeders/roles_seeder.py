from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

from .base_seeder import BaseSeeder
from ..relational_db.tables.roles.roles_table import Role


class RolesSeeder(BaseSeeder):
    """Seeder for basic roles"""

    async def seed(self) -> None:
        existing_count = await self.get_record_count(Role)
        if existing_count > 0 and not self.force:
            self.log_progress(f"Table already has {existing_count} roles, skipping...")
            return

        if self.force:
            self.log_progress("Deleting existing roles...")
            await self.session.execute(delete(Role))

        roles = [
            {"slug": "admin", "name": "Administrator", "description": "Full access"},
            {"slug": "supplier", "name": "Supplier", "description": "Seller organization owner"},
            {"slug": "buyer", "name": "Buyer", "description": "Regular customer"},
            {"slug": "staff", "name": "Staff", "description": "Organization staff"},
        ]

        stmt = insert(Role).values(roles)
        stmt = stmt.on_conflict_do_update(
            index_elements=["slug"],
            set_={
                "name": stmt.excluded.name,
                "description": stmt.excluded.description,
                "updated_at": stmt.excluded.updated_at,
            },
        )
        await self.session.execute(stmt)
        await self.commit()

        self.log_progress(f"Successfully seeded {len(roles)} roles")
        await self.verify_count(Role, len(roles), "roles")
