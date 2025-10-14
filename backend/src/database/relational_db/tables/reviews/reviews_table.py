from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, Uuid, Text, Integer, CheckConstraint, UniqueConstraint

from ..table_base import Base
from ..mixins import TimestampMixin


class ProductReview(TimestampMixin, Base):
    """Product reviews table"""
    __tablename__ = "product_reviews"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    order_item_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("order_items.id"), nullable=False, comment="User ID")
    product_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False, comment="Product ID")
    seller_org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False, comment="Product ID")
    reviewer_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, comment="User ID")
    
    rating: Mapped[int] = mapped_column(Integer, nullable=False, comment="Rating")

    title: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Review title")
    body: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Review body")
    
    product: Mapped["Product"] = relationship(lazy="selectin") # type: ignore
    user: Mapped["User"] = relationship(lazy="selectin") # type: ignore
    
    
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_limit_product_reviews'),
        UniqueConstraint('reviewer_user_id', 'product_id', name='unique_user_product_rating'),
    )


class SellerReview(TimestampMixin, Base):
    """Seller reviews table"""
    __tablename__ = "seller_reviews"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    order_item_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("order_items.id"), nullable=False, comment="User ID")
    seller_org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False, comment="Product ID")
    reviewer_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, comment="User ID")
    
    rating: Mapped[int] = mapped_column(Integer, nullable=False, comment="Rating")

    title: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Review title")
    body: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Review body")
    
    user: Mapped["User"] = relationship(lazy="selectin") # type: ignore
    
    
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_limit_seller_reviews'),
        UniqueConstraint('reviewer_user_id', 'order_item_id', name='unique_user_seller_rating'),
    )
