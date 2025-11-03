from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, ForeignKey, DateTime, Uuid
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import CreatedAtMixin
from domain.organizations import MembershipRole


class OrgMembership(CreatedAtMixin, Base):
    __tablename__ = "org_memberships"

    org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    role: Mapped[MembershipRole] = mapped_column(ENUM(MembershipRole, name="membership_role"), nullable=False)
    invited_by: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    invited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = ()
