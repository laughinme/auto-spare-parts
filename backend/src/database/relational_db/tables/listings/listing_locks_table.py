from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey, Uuid, Text, DateTime
from sqlalchemy.dialects.postgresql import ENUM

from domain.listings import LockState

from ..table_base import Base
from ..mixins import TimestampMixin


class ListingLock(TimestampMixin, Base):
    """Listing locks table: controls exclusive access to listing objects."""
    __tablename__ = "listing_locks"

    product_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )

    state: Mapped[LockState] = mapped_column(ENUM(LockState), nullable=False, comment="Lock type: soft for temporary/heartbeat, firm for order/final")

    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    session_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True, comment="Session ID (for soft/heartbeat locks)")
    order_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True, comment="Order ID (for firm locks, binding to an order)")
    payment_intent_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True, comment="When the lock expires")
