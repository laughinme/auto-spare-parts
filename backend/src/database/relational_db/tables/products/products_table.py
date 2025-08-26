from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, ForeignKey, Uuid, Text, Numeric, Integer, Boolean, CheckConstraint, Index, or_, false, and_
from sqlalchemy.dialects.postgresql import ENUM

from domain.products import ProductStatus, ProductCondition, ProductOriginality, StockType
from ..table_base import Base
from ..mixins import TimestampMixin, CreatedAtMixin


class Product(TimestampMixin, Base):
    """Products table (auto parts)"""
    __tablename__ = "products"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False, comment="Seller organization ID")
    make_id: Mapped[int] = mapped_column(Integer, ForeignKey("makes.make_id"), nullable=False, comment="Make ID (vPIC)")
    
    title: Mapped[str] = mapped_column(String, nullable=False, comment="Product title")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Product listing description")
    
    part_number: Mapped[str] = mapped_column(String, nullable=False, index=True, comment="Part number (OEM or aftermarket)")
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, comment="Price in USD")
    
    stock_type: Mapped[StockType] = mapped_column(ENUM(StockType, name="product_stock_type"), nullable=False, comment="Part stock type")
    quantity_original: Mapped[int] = mapped_column(Integer, nullable=False, comment="Original part stock quantity")
    quantity_on_hand: Mapped[int] = mapped_column(Integer, nullable=False, default=0, comment="Part stock quantity on hand")
    
    condition: Mapped[ProductCondition] = mapped_column(ENUM(ProductCondition, name="product_condition"), nullable=False, comment="Part condition")
    originality: Mapped[ProductOriginality] = mapped_column(ENUM(ProductOriginality, name="product_originality"), nullable=False, comment="Part originality")
    
    # Service fields
    status: Mapped[ProductStatus] = mapped_column(
        ENUM(ProductStatus, name="product_status"), nullable=False, default=ProductStatus.DRAFT, comment="Publication status"
    )
    allow_cart: Mapped[bool] = mapped_column(Boolean, nullable=False, comment="Allow adding to cart")
    allow_chat: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, comment="Allow chat with seller")

    # Relationships
    media: Mapped[list["ProductMedia"]] = relationship(back_populates="product", cascade="all, delete-orphan", lazy="selectin")
    organization: Mapped["Organization"] = relationship(lazy="selectin") # type: ignore
    make: Mapped["Make"] = relationship(lazy="selectin") # type: ignore

    __table_args__ = (
        CheckConstraint(price >= 0, name="ck_products_price_nonnegative"),
        CheckConstraint(
            or_(stock_type != StockType.UNIQUE, allow_cart.is_(false())),
            name="ck_products_unique_no_cart",
        ),
        CheckConstraint(
            and_(quantity_original >= 0, quantity_on_hand >= 0),
            name="ck_products_qty_nonnegative",
        ),
        CheckConstraint(
            or_(
                stock_type != StockType.UNIQUE,
                and_(quantity_original == 1, quantity_on_hand.in_([0, 1])),
            ),
            name="ck_products_unique_qty_shape",
        ),
        # CheckConstraint(
        #     quantity_on_hand <= quantity_original,
        #     name="ck_products_qoh_le_original",
        # ),
        CheckConstraint(
            or_(allow_cart, allow_chat),
            name="ck_products_at_least_one_channel"
        ),

        Index("ix_products_org_status", org_id, status),
        Index(
            'ix_products_title_trgm',
            'title',
            postgresql_using='gin',
            postgresql_ops={'title': 'gin_trgm_ops'}
        ),
        Index(
            'ix_products_description_trgm',
            'description',
            postgresql_using='gin',
            postgresql_ops={'description': 'gin_trgm_ops'}
        ),
        Index(
            'ix_products_part_number_trgm',
            'part_number',
            postgresql_using='gin',
            postgresql_ops={'part_number': 'gin_trgm_ops'}
        ),
    )


class ProductMedia(CreatedAtMixin, Base):
    """Product media files table (photos)"""
    __tablename__ = "product_media"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    product_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False, comment="Product ID")

    url: Mapped[str] = mapped_column(String, nullable=False, comment="Media file URL")
    alt: Mapped[str | None] = mapped_column(String, nullable=True, comment="Alternative text")

    product: Mapped[Product] = relationship(back_populates="media")
