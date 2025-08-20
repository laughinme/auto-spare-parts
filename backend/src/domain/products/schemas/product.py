from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from ...common.timestamps import TimestampModel
from ..enums.status import ProductStatus
from ..enums.condition import ProductCondition


class MediaModel(BaseModel):
    """Product media file model (photos, etc.)"""
    id: UUID = Field(..., description="Media file ID")
    url: str = Field(..., description="Media file URL")
    alt: str | None = Field(None, description="Alternative text for image")


class MediaCreate(BaseModel):
    """Schema for media file upload"""
    url: str = Field(..., description="Media file URL")
    alt: str | None = Field(None, description="Alternative text")


class ProductModel(TimestampModel):
    """Product model for API responses"""
    # model_config = {"from_attributes": True}
    
    id: UUID = Field(..., description="Unique product ID")
    org_id: UUID = Field(..., description="Seller organization ID")
    
    # Main part information
    brand: str = Field(..., description="Part brand/manufacturer (e.g., BMW, Bosch)")
    part_number: str = Field(..., description="Part number (OEM or aftermarket)")
    price: float = Field(..., ge=0, description="Price in USD")
    condition: ProductCondition = Field(..., description="Part condition")
    description: str | None = Field(None, description="Product listing description")
    
    # Service fields
    status: ProductStatus = Field(..., description="Publication status")
    media: list[MediaModel] = Field(default_factory=list, description="Product photos")


class ProductCreate(BaseModel):
    """Schema for product creation"""
    brand: str = Field(..., description="Part brand/manufacturer")
    part_number: str = Field(..., description="Part number")
    price: float = Field(..., ge=0, description="Price in USD")
    condition: ProductCondition = Field(..., description="Part condition")
    description: str | None = Field(None, description="Product listing description")
    status: ProductStatus = Field(ProductStatus.DRAFT, description="Publication status")


class ProductPatch(BaseModel):
    """Schema for partial product update"""
    brand: Optional[str] = Field(None, description="Part brand/manufacturer")
    part_number: Optional[str] = Field(None, description="Part number")
    price: Optional[float] = Field(None, ge=0, description="Price in USD")
    condition: Optional[ProductCondition] = Field(None, description="Part condition")
    description: Optional[str] = Field(None, description="Product listing description")
    status: Optional[ProductStatus] = Field(None, description="Publication status")
