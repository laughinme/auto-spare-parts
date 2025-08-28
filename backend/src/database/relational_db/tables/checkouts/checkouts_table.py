from datetime import datetime
from uuid import UUID, uuid4
from decimal import Decimal
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, ForeignKey, Uuid, DateTime, Numeric
from sqlalchemy.dialects.postgresql import ENUM

from domain.payments import PaymentStatus
from ..table_base import Base
from ..mixins import TimestampMixin


class CheckoutSession(TimestampMixin, Base):
    __tablename__ = "checkout_sessions"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    buyer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, comment="Buyer user ID"
    )
    
    currency: Mapped[str] = mapped_column(String, nullable=False, default="usd", comment="Currency of the checkout session")
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, comment="Total order amount in USD")
    
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String, nullable=True, comment="Stripe Payment Intent ID")
    payment_status: Mapped[PaymentStatus] = mapped_column(ENUM(PaymentStatus), nullable=False, default=PaymentStatus.PENDING, comment="Checkout session status")
    
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment="Checkout session expiration time")

    # Relationships
    buyer: Mapped["User"] = relationship(lazy="selectin")  # type: ignore
    order: Mapped["Order"] = relationship(back_populates="checkout_session", lazy="selectin")  # type: ignore
    checkout_items: Mapped[list["CheckoutItem"]] = relationship(back_populates="checkout_session", lazy="selectin")  # type: ignore
