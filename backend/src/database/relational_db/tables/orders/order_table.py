from uuid import UUID, uuid4
from decimal import Decimal
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, ForeignKey, Uuid, Text, Integer, Numeric
from sqlalchemy.dialects.postgresql import ENUM

from domain.orders import OrderStatus
from domain.payments import PaymentStatus
from domain.products import ProductCondition, ProductOriginality
from ..table_base import Base
from ..mixins import TimestampMixin


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    buyer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, comment="Buyer user ID"
    )
    # checkout_session_id: Mapped[UUID] = mapped_column(
    #     Uuid(as_uuid=True), ForeignKey("checkout_sessions.id"), nullable=True, comment="Checkout session ID"
    # )
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String, nullable=True, comment="Stripe Payment Intent ID")
    stripe_checkout_session_id: Mapped[str | None] = mapped_column(String, nullable=True, comment="Stripe Checkout Session ID")

    payment_status: Mapped[PaymentStatus] = mapped_column(
        ENUM(PaymentStatus), nullable=False, default=PaymentStatus.PENDING, comment="Order payment status"
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, comment="Total order amount in USD")
    total_items: Mapped[int] = mapped_column(Integer, nullable=False, comment="Total number of items in order")
    unique_items: Mapped[int] = mapped_column(Integer, nullable=False, comment="Total number of unique items in order")
    
    notes: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Order notes from buyer")
    
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Shipping address JSON")
    # tracking_number: Mapped[str | None] = mapped_column(String, nullable=True, comment="Shipping tracking number")

    # Relationships
    items: Mapped[list["OrderItem"]] = relationship('OrderItem', back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    buyer: Mapped["User"] = relationship(lazy="selectin", foreign_keys=[buyer_id])  # type: ignore
    # checkout_session: Mapped["CheckoutSession"] = relationship(back_populates="order", lazy="selectin")  # type: ignore


class OrderItem(TimestampMixin, Base):
    __tablename__ = "order_items"

    # Primary key and relationships
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    order_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("orders.id"), nullable=False, comment="Order ID")
    # Maybe product_id nullable and ondelete set null
    product_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, comment="Product ID")
    seller_org_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False, comment="Seller organization ID"
    )
    cart_item_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("cart_items.id", ondelete="SET NULL"), nullable=True, comment="Cart item ID"
    )

    # Item data (snapshot at time of purchase)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, comment="Quantity ordered")
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, comment="Price per unit at time of purchase (USD)")
    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, comment="Total price for this item (quantity * unit_price)")
    
    # Product snapshot (in case product details change later)
    product_make_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("makes.make_id"), nullable=False, comment="Product make ID at time of purchase"
    )
    product_make_name: Mapped[str] = mapped_column(String, nullable=False, comment="Product make name at time of purchase")
    product_part_number: Mapped[str] = mapped_column(String, nullable=False, comment="Product part number at time of purchase")
    product_condition: Mapped[ProductCondition] = mapped_column(ENUM(ProductCondition), nullable=False, comment="Product condition at time of purchase")
    product_title: Mapped[str] = mapped_column(String, nullable=False, comment="Product title at time of purchase")
    product_description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Product description at time of purchase")
    
    # tracking_number: Mapped[str | None] = mapped_column(String, nullable=True, comment="Shipping tracking number")
    
    status: Mapped[OrderStatus] = mapped_column(
        ENUM(OrderStatus), nullable=False, default=OrderStatus.PENDING, comment="Order status"
    )

    # Relationships
    order: Mapped["Order"] = relationship(back_populates="items", lazy="selectin")
    make: Mapped["Make"] = relationship(lazy="selectin")  # type: ignore
    product: Mapped["Product"] = relationship(lazy="selectin")  # type: ignore
    seller_organization: Mapped["Organization"] = relationship(lazy="selectin")  # type: ignore
