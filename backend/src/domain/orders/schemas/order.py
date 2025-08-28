from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field
from typing import List, Optional

from ..enums import OrderStatus
from ...common import TimestampModel
from ...products import ProductModel, ProductCondition
from ...organizations import OrganizationModel


class OrderItemModel(TimestampModel):
    """Order item model for API responses"""
    
    id: UUID = Field(..., description="Unique order item ID")
    product: ProductModel = Field(..., description="Product details")
    quantity: int = Field(..., ge=1, description="Quantity ordered")
    unit_price: Decimal = Field(..., ge=0, description="Price per unit at time of purchase (USD)")
    total_price: Decimal = Field(..., ge=0, description="Total price for this item")
    
    # Product snapshot at time of purchase
    product_make_id: int = Field(..., description="Product make ID at time of purchase")
    product_part_number: str = Field(..., description="Product part number at time of purchase")
    product_condition: ProductCondition = Field(..., description="Product condition at time of purchase")


class OrderModel(TimestampModel):
    """Order model for API responses"""
    
    id: UUID = Field(..., description="Unique order ID")
    buyer_id: UUID = Field(..., description="Buyer user ID")
    seller_organization: OrganizationModel = Field(..., description="Seller organization details")
    
    # Order details
    status: OrderStatus = Field(..., description="Order status")
    total_amount: Decimal = Field(..., ge=0, description="Total order amount in USD")
    total_items: int = Field(..., ge=0, description="Total number of items in order")
    items: List[OrderItemModel] = Field(default_factory=list, description="Order items")
    
    # Optional fields
    notes: Optional[str] = Field(None, description="Order notes from buyer")
    tracking_number: Optional[str] = Field(None, description="Shipping tracking number")


class OrderSummary(BaseModel):
    """Simplified order summary"""
    
    id: UUID = Field(..., description="Order ID")
    status: OrderStatus = Field(..., description="Order status")
    total_amount: Decimal = Field(..., ge=0, description="Total order amount")
    total_items: int = Field(..., ge=0, description="Total number of items")
    seller_org_name: str = Field(..., description="Seller organization name")


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status"""
    
    status: OrderStatus = Field(..., description="New order status")
    tracking_number: Optional[str] = Field(None, description="Tracking number (if shipped)")


class OrderList(BaseModel):
    """Paginated order list response"""
    
    orders: List[OrderSummary] = Field(default_factory=list, description="List of orders")
    total: int = Field(..., ge=0, description="Total number of orders")
    offset: int = Field(..., ge=0, description="Current offset")
    limit: int = Field(..., ge=1, description="Items per page")
