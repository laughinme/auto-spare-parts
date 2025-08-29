from datetime import datetime
from uuid import UUID, uuid4
from decimal import Decimal
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Uuid, Integer, Numeric, select, func, UniqueConstraint, String, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.ext.hybrid import hybrid_property

from domain.carts import CartItemStatus
from ..table_base import Base
from ..mixins import TimestampMixin


class Cart(TimestampMixin, Base):
    __tablename__ = "carts"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, comment="Owner user ID")
    
    @hybrid_property
    def unique_items(self) -> int:
        return len([item for item in self.items if item.status == CartItemStatus.ACTIVE])

    @unique_items.expression
    @classmethod
    def unique_items_expr(cls):
        return (
            select(func.coalesce(func.count(CartItem.product_id), 0))
            .where(
                CartItem.cart_id == cls.id,
                CartItem.status == CartItemStatus.ACTIVE
            )
            .label("unique_items")
        )
    
    @hybrid_property
    def total_items(self) -> int:
        return sum(i.quantity for i in self.items if i.status == CartItemStatus.ACTIVE)

    @total_items.expression
    @classmethod
    def total_items_expr(cls):
        return (
            select(func.coalesce(func.sum(CartItem.quantity), 0))
            .where(
                CartItem.cart_id == cls.id,
                CartItem.status == CartItemStatus.ACTIVE
            )
            .label("total_items")
        )
        
    @hybrid_property
    def total_amount(self) -> Decimal:
        return sum((i.total_price for i in self.items if i.status == CartItemStatus.ACTIVE), start=Decimal('0'))

    @total_amount.expression
    @classmethod
    def total_amount_expr(cls):
        return (
            select(func.coalesce(func.sum(CartItem.total_price), 0))
            .where(
                CartItem.cart_id == cls.id,
                CartItem.status == CartItemStatus.ACTIVE
            )
            .label("total_amount")
        )

    # Relationships
    items: Mapped[list["CartItem"]] = relationship(back_populates="cart", cascade="all, delete-orphan", lazy="selectin")
    user: Mapped["User"] = relationship(lazy="selectin")  # type: ignore


class CartItem(TimestampMixin, Base):
    __tablename__ = "cart_items"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    cart_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("carts.id"), nullable=False, comment="Cart ID")
    product_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False, comment="Product ID")
    seller_org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False, comment="Seller organization ID")
    order_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, comment="Order ID"
    )
    
    title: Mapped[str] = mapped_column(String, nullable=False, comment="Product title snapshot")
    description: Mapped[str] = mapped_column(String, nullable=True, comment="Product description snapshot")
    part_number: Mapped[str] = mapped_column(String, nullable=False, comment="Product part number snapshot")

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1, comment="Quantity of this product")
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, comment="Price per unit when added to cart (USD)")
    
    status: Mapped[CartItemStatus] = mapped_column(ENUM(CartItemStatus), nullable=False, default=CartItemStatus.ACTIVE, comment="Cart item status")
    
    locked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, comment="Date and time when the item was locked")
    lock_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, comment="Date and time when the lock expires")

    @hybrid_property
    def total_price(self) -> Decimal:
        return Decimal(self.quantity * self.unit_price)

    @total_price.expression
    @classmethod
    def total_price_expr(cls):
        return (cls.quantity * cls.unit_price).cast(Numeric(12, 2))

    # Relationships
    cart: Mapped[Cart] = relationship(back_populates="items", lazy="selectin")
    product: Mapped["Product"] = relationship(lazy="selectin")  # type: ignore
    
    table_args = (
        UniqueConstraint(
            "cart_id",
            "product_id",
            name="uix_cart_item_unique"
        ),
        CheckConstraint(
            "(status <> 'locked') OR (status = 'locked' AND order_id IS NOT NULL)",
            name="ck_cart_item_status_locked_order_id"
        )
    )
