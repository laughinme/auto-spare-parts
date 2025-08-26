from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator, field_validator

from ..enums import ProductStatus, ProductCondition, ProductOriginality, StockType
from ...common.timestamps import TimestampModel
from ...organizations import OrganizationShare
from ...makes import MakeModel


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
    
    title: str = Field(..., description="Product title")
    description: str | None = Field(None, description="Product listing description")
    
    make: MakeModel = Field(..., description="Part brand/manufacturer")
    part_number: str = Field(..., description="Part number (OEM or aftermarket)")
    price: float = Field(..., ge=0, description="Price in USD")
    
    stock_type: StockType = Field(..., description="Part stock type")
    quantity: int = Field(..., description="Part stock quantity on hand", alias="quantity_on_hand")
    
    condition: ProductCondition = Field(..., description="Part condition")
    originality: ProductOriginality = Field(..., description="Part originality")
    
    allow_cart: bool = Field(..., description="Allow adding to cart. If stock_type is UNIQUE, this must be False.")
    allow_chat: bool = Field(True, description="Allow chat with seller")
    
    status: ProductStatus = Field(..., description="Publication status")
    is_in_stock: bool = Field(..., description="Is product in stock")
    is_buyable: bool = Field(..., description="Is product buyable")
    
    media: list[MediaModel] = Field(default_factory=list, description="Product photos")
    
    organization: OrganizationShare = Field(..., description="Seller organization")

class ProductBrief(BaseModel):
    """
    Brief product model for list views and summaries.
    """
    id: UUID = Field(..., description="Unique product ID")
    title: str = Field(..., description="Product title")
    make: MakeModel = Field(..., description="Part brand/manufacturer")
    part_number: str = Field(..., description="Part number")
    price: float = Field(..., ge=0, description="Price in USD")
    allow_cart: bool = Field(..., description="Allow adding to cart. If stock_type is UNIQUE, this must be False.")
    # photo_url: str | None = Field(
    #     None,
    #     description="URL of the first product photo, or None if no photos are available"
    # )
    media: list[MediaModel] = Field(default_factory=list, description="Product photos")
    
class ProductCreate(BaseModel):
    title: str = Field(..., description="Product title")
    description: str | None = Field(None, description="Product listing description")
    
    make_id: int = Field(..., description="Part brand/manufacturer id")
    part_number: str = Field(..., description="Official part number")
    price: Decimal = Field(..., ge=0, description="Price in USD (2 decimal places)")
        
    stock_type: StockType = Field(..., description="Part stock type")
    quantity: int = Field(..., description="Part stock quantity")
    
    condition: ProductCondition = Field(..., description="Part condition")
    originality: ProductOriginality = Field(..., description="Part originality")
    
    status: ProductStatus = Field(ProductStatus.DRAFT, description="Publication status")
    allow_cart: bool = Field(..., description="Allow adding to cart. If stock_type is UNIQUE, this must be False.")
    allow_chat: bool = Field(True, description="Allow chat with seller")
    
    @field_validator("price")
    @classmethod
    def price_two_decimal_places(cls, v: Decimal) -> Decimal:
        if v != v.quantize(Decimal("0.01")):
            raise ValueError("Price must have exactly two decimal places")
        return v
    
    @model_validator(mode='after')
    def check_integrity(self):
        if self.stock_type == StockType.UNIQUE:
            if self.allow_cart:
                raise ValueError("Cart cannot be allowed for UNIQUE stock type")
            if self.quantity != 1:
                raise ValueError("Quantity must be 1 for UNIQUE stock type")
        if self.status == ProductStatus.PUBLISHED:
            if self.quantity <= 0:
                raise ValueError("Quantity must be greater than 0 for published products")
            if self.price <= 0:
                raise ValueError("Price must be greater than 0 for published products")
        if not self.allow_cart and not self.allow_chat:
            raise ValueError("Product must allow either cart or chat")
        return self

class ProductPatch(BaseModel):
    """
    Patch model for updating product fields. All fields are optional.
    """
    title: str | None = Field(None, description="Product title")
    description: str | None = Field(None, description="Product listing description")
    
    make_id: int | None = Field(None, description="Part brand/manufacturer id")
    part_number: str | None = Field(None, description="Official part number")
    price: Decimal | None = Field(None, ge=0, description="Price in USD (2 decimal places)")
    
    stock_type: StockType | None = Field(None, description="Part stock type")
    quantity: int | None = Field(None, description="Part stock quantity")
    
    condition: ProductCondition | None = Field(None, description="Part condition")
    originality: ProductOriginality | None = Field(None, description="Part originality")
    status: ProductStatus | None = Field(None, description="Publication status")
    allow_cart: bool | None = Field(None, description="Allow adding to cart. If stock_type is UNIQUE, this must be False.")
    allow_chat: bool | None = Field(None, description="Allow chat with seller")
    
    @field_validator("price")
    @classmethod
    def price_two_decimal_places(cls, v: Decimal) -> Decimal:
        if v != v.quantize(Decimal("0.01")):
            raise ValueError("Price must have exactly two decimal places")
        return v
    
    @model_validator(mode='after')
    def check_stock_type(self):
        if self.stock_type is not None and self.stock_type == StockType.UNIQUE and self.allow_cart:
            raise ValueError("Cart cannot be allowed for UNIQUE stock type")
        return self
