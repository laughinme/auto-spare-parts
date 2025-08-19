from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, ForeignKey, DateTime, Uuid, UniqueConstraint
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import CreatedAtMixin
from domain.organizations.enums import MembershipRole


class OrgInvite(CreatedAtMixin, Base):
    __tablename__ = "org_invites"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    token: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    role: Mapped[MembershipRole] = mapped_column(ENUM(MembershipRole, name="membership_role"), nullable=False)

    __table_args__ = (
        UniqueConstraint('org_id', 'email', name='uq_org_invite_org_email'),
        UniqueConstraint('token', name='uq_org_invite_token'),
    )
