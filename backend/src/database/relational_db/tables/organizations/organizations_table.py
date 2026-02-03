from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, ForeignKey, Uuid, Index
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import CreatedAtMixin
from domain.organizations.enums import OrganizationType, KycStatus, PayoutSchedule


class Organization(CreatedAtMixin, Base):
    __tablename__ = "organizations"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    owner_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stripe_account_id: Mapped[str | None] = mapped_column(String, nullable=True)
    
    type: Mapped[OrganizationType] = mapped_column(ENUM(OrganizationType, name="organization_type"), default=OrganizationType.SUPPLIER, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=True)
    kyc_status: Mapped[KycStatus] = mapped_column(ENUM(KycStatus, name="kyc_status"), default=KycStatus.NOT_STARTED, nullable=False)
    payout_schedule: Mapped[PayoutSchedule] = mapped_column(ENUM(PayoutSchedule, name="payout_schedule"), default=PayoutSchedule.WEEKLY, nullable=False)
    
    # TODO: Add creator user id and relationship
    # creator_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    # creator: Mapped["User"] = relationship(back_populates="created_organizations", lazy="selectin", foreign_keys=[creator_user_id]) # type: ignore
    
    # Minimal Stripe linkage kept for UI flows only
    
    owner: Mapped["User"] = relationship(back_populates="organization", lazy="selectin", foreign_keys=[owner_user_id]) # type: ignore
    products: Mapped[list["Product"]] = relationship(back_populates="organization", lazy="selectin") # type: ignore

    __table_args__ = (
        Index(
            'organizations_name_trgm',
            'name',
            postgresql_using='gin',
            postgresql_ops={'name': 'gin_trgm_ops'}
        ),
    )
