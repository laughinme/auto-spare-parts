from uuid import UUID, uuid4
from decimal import Decimal
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Uuid, Integer, Numeric, select, func, UniqueConstraint, String
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.ext.hybrid import hybrid_property

from ..table_base import Base
from ..mixins import TimestampMixin


class Cart(TimestampMixin, Base):
    __tablename__ = "carts"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, comment="Owner user ID")
    
    @hybrid_property
    def unique_items(self) -> int:
        return len(self.items)

    @unique_items.expression
    @classmethod
    def unique_items_expr(cls):
        return (
            select(func.coalesce(func.count(CartItem.product_id), 0))
            .where(CartItem.cart_id == cls.id)
            .label("unique_items")
        )
    
    @hybrid_property
    def total_items(self) -> int:
        return sum(i.quantity for i in self.items)

    @total_items.expression
    @classmethod
    def total_items_expr(cls):
        return (
            select(func.coalesce(func.sum(CartItem.quantity), 0))
            .where(CartItem.cart_id == cls.id)
            .label("total_items")
        )
        
    @hybrid_property
    def total_amount(self) -> float:
        return sum(i.total_price for i in self.items)

    @total_amount.expression
    @classmethod
    def total_amount_expr(cls):
        return (
            select(func.coalesce(func.sum(CartItem.total_price), 0))
            .where(CartItem.cart_id == cls.id)
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
    
    title: Mapped[str] = mapped_column(String, nullable=False, comment="Product title snapshot")
    description: Mapped[str] = mapped_column(String, nullable=True, comment="Product description snapshot")
    part_number: Mapped[str] = mapped_column(String, nullable=False, comment="Product part number snapshot")
    

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1, comment="Quantity of this product")
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, comment="Price per unit when added to cart (USD)")

    @hybrid_property
    def total_price(self) -> float:
        return self.quantity * self.unit_price

    @total_price.expression
    @classmethod
    def total_price_expr(cls):
        return cls.quantity * cls.unit_price

    # Relationships
    cart: Mapped[Cart] = relationship(back_populates="items", lazy="selectin")
    product: Mapped["Product"] = relationship(lazy="selectin")  # type: ignore
    
    table_args = (
        UniqueConstraint(
            "cart_id",
            "product_id",
            name="uix_cart_item_unique"
        ),
    )
