from uuid import UUID
from pydantic import BaseModel, Field

from ...common import CreatedAtModel
from ...products import ProductModel, ProductBrief


class CartItemModel(CreatedAtModel):
    """Cart item model for API responses"""
    
    id: UUID = Field(..., description="Unique cart item ID")
    product: ProductBrief = Field(..., description="Product details")
    quantity: int = Field(..., ge=1, description="Quantity of this product in cart")
    unit_price: float = Field(..., ge=0, description="Price per unit when added to cart (USD)")
    total_price: float = Field(..., ge=0, description="Total price for this item (quantity * unit_price)")

class CartModel(BaseModel):
    """Cart model for API responses"""
    
    id: UUID = Field(..., description="Unique cart ID")
    user_id: UUID = Field(..., description="Owner user ID")
    items: list[CartItemModel] = Field(default_factory=list, description="Items in cart")
    unique_items: int = Field(..., ge=0, description="Total number of unique items in cart")
    total_items: int = Field(..., ge=0, description="Total number of items in cart")
    total_amount: float = Field(..., ge=0, description="Total cart value in USD")

class CartItemCreate(BaseModel):
    """Schema for adding item to cart"""
    
    product_id: UUID = Field(..., description="Product ID to add to cart")
    quantity: int = Field(1, ge=1, le=99, description="Quantity to add (max 99 per item)")

class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity"""
    
    quantity: int = Field(..., ge=1, le=99, description="New quantity (max 99 per item)")

class CartSummary(BaseModel):
    """Simplified cart summary for quick responses"""
    
    total_items: int = Field(..., ge=0, description="Total number of items in cart")
    total_amount: float = Field(..., ge=0, description="Total cart value in USD")

class CartItemRemove(BaseModel):
    """Schema for removing item from cart"""
    
    cart_item_id: UUID = Field(..., description="ID of the cart item to remove")
