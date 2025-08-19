from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, ForeignKey, Uuid, Index
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import CreatedAtMixin
from domain.organizations.enums import OrganizationType, KycStatus, PayoutSchedule


class Organization(CreatedAtMixin, Base):
    __tablename__ = "organizations"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    type: Mapped[OrganizationType] = mapped_column(ENUM(OrganizationType, name="organization_type"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)
    owner_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stripe_account_id: Mapped[str | None] = mapped_column(String, nullable=True)
    kyc_status: Mapped[KycStatus] = mapped_column(ENUM(KycStatus, name="kyc_status"), nullable=False)
    payout_schedule: Mapped[PayoutSchedule] = mapped_column(ENUM(PayoutSchedule, name="payout_schedule"), nullable=False)

    __table_args__ = (
        Index(
            'organizations_name_trgm',
            'name',
            postgresql_using='gin',
            postgresql_ops={'name': 'gin_trgm_ops'}
        ),
    )
