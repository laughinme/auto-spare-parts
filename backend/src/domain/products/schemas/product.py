from uuid import UUID
from pydantic import BaseModel, Field, model_validator, computed_field

from ..enums import ProductStatus, ProductCondition
from ...common.timestamps import TimestampModel
from ...organizations import OrganizationShare


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
    
    id: UUID = Field(..., description="Unique product ID")
    organization: OrganizationShare = Field(..., description="Seller organization ID")
    
    brand: str = Field(..., description="Part brand/manufacturer (e.g., BMW, Mercedes)")
    part_number: str = Field(..., description="Part number (OEM or aftermarket)")
    price: float = Field(..., ge=0, description="Price in USD")
    condition: ProductCondition = Field(..., description="Part condition")
    description: str | None = Field(None, description="Product listing description")
    
    status: ProductStatus = Field(..., description="Publication status")
    media: list[MediaModel] = Field(default_factory=list, description="Product photos")

class ProductBrief(BaseModel):
    """
    Brief product model for list views and summaries.
    """
    id: UUID = Field(..., description="Unique product ID")
    brand: str = Field(..., description="Part brand/manufacturer (e.g., BMW, Mercedes)")
    part_number: str = Field(..., description="Part number (OEM or aftermarket)")
    price: float = Field(..., ge=0, description="Price in USD")
    # photo_url: str | None = Field(
    #     None,
    #     description="URL of the first product photo, or None if no photos are available"
    # )
    media: list[MediaModel] = Field(default_factory=list, description="Product photos")
    
class ProductCreate(BaseModel):
    brand: str = Field(..., description="Part brand/manufacturer")
    part_number: str = Field(..., description="Part number")
    price: float = Field(..., ge=0, description="Price in USD")
    condition: ProductCondition = Field(..., description="Part condition")
    description: str | None = Field(None, description="Product listing description")
    status: ProductStatus = Field(ProductStatus.DRAFT, description="Publication status")


class ProductPatch(BaseModel):
    brand: str | None = Field(None, description="Part brand/manufacturer")
    part_number: str | None = Field(None, description="Part number")
    price: float | None = Field(None, ge=0, description="Price in USD")
    condition: ProductCondition | None = Field(None, description="Part condition")
    description: str | None = Field(None, description="Product listing description")
    status: ProductStatus | None = Field(None, description="Publication status")
