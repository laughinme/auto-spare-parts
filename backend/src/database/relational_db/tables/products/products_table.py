from uuid import UUID, uuid4
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import String, ForeignKey, Uuid, Text, Numeric
from sqlalchemy.dialects.postgresql import ENUM

from ..table_base import Base
from ..mixins import TimestampMixin, CreatedAtMixin
from domain.products.enums.status import ProductStatus
from domain.products.enums.condition import ProductCondition


class Product(TimestampMixin, Base):
    """Products table (auto parts)"""
    __tablename__ = "products"

    # Primary key and relationships
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    org_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False, comment="Seller organization ID")

    # Main part information
    brand: Mapped[str] = mapped_column(String, nullable=False, comment="Part brand/manufacturer")
    part_number: Mapped[str] = mapped_column(String, nullable=False, comment="Part number (OEM or aftermarket)")
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, comment="Price in USD")
    condition: Mapped[ProductCondition] = mapped_column(ENUM(ProductCondition, name="product_condition"), nullable=False, comment="Part condition")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Product listing description")
    
    # Service fields
    status: Mapped[ProductStatus] = mapped_column(ENUM(ProductStatus, name="product_status"), nullable=False, default=ProductStatus.DRAFT, comment="Publication status")

    # Related data
    media: Mapped[list["ProductMedia"]] = relationship(back_populates="product", cascade="all, delete-orphan", lazy="selectin")


class ProductMedia(CreatedAtMixin, Base):
    """Product media files table (photos)"""
    __tablename__ = "product_media"

    # Primary key and relationships
    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), default=uuid4, primary_key=True)
    product_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False, comment="Product ID")

    # Media file data
    url: Mapped[str] = mapped_column(String, nullable=False, comment="Media file URL")
    alt: Mapped[str | None] = mapped_column(String, nullable=True, comment="Alternative text")

    # Back reference
    product: Mapped[Product] = relationship(back_populates="media")
