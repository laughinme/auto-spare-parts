
from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Uuid, Integer

from ..table_base import Base
from ..mixins import TimestampMixin


class CheckoutItem(TimestampMixin, Base):
    __tablename__ = "checkout_items"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    checkout_session_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("checkout_sessions.id"), nullable=False, comment="Checkout session ID"
    )
    
    product_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False, comment="Product ID")
    cart_item_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("cart_items.id"), nullable=False, comment="Cart item ID")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, comment="Quantity")

    # Relationships
    checkout_session: Mapped["CheckoutSession"] = relationship(back_populates="items", lazy="selectin")  # type: ignore
    product: Mapped["Product"] = relationship(lazy="selectin")  # type: ignore
    cart_item: Mapped["CartItem"] = relationship(lazy="selectin")  # type: ignore
