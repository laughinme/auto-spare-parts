from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field

from ..enums import OrderStatus
from ...common import TimestampModel
from ...products import ProductModel, ProductCondition
from ...organizations import OrganizationShare
from ...payments import PaymentStatus


class OrderItemModel(BaseModel):
    """Order item model for API responses"""
    
    id: UUID = Field(..., description="Unique order item ID")
    
    quantity: int = Field(..., ge=1, description="Quantity ordered")
    unit_price: Decimal = Field(..., ge=0, description="Price per unit at time of purchase (USD)")
    total_price: Decimal = Field(..., ge=0, description="Total price for this item")
    
    # Product snapshot at time of purchase
    product_make_id: int = Field(..., description="Product make ID at time of purchase")
    product_make_name: str = Field(..., description="Product make name at time of purchase")
    product_part_number: str = Field(..., description="Product part number at time of purchase")
    product_condition: ProductCondition = Field(..., description="Product condition at time of purchase")
    product_title: str = Field(..., description="Product title at time of purchase")
    product_description: str | None = Field(None, description="Product description at time of purchase")
    
    status: OrderStatus = Field(..., description="Order status")
    
    product: ProductModel = Field(..., description="Product details")
    # seller_organization: OrganizationShare = Field(..., description="Seller organization details")


class OrderModel(TimestampModel):
    """Order model for API responses"""
    
    id: UUID = Field(..., description="Unique order ID")
    buyer_id: UUID = Field(..., description="Buyer user ID")
    
    # Order details
    payment_status: PaymentStatus = Field(..., description="Order payment status")
    total_amount: Decimal = Field(..., ge=0, description="Total order amount in USD")
    total_items: int = Field(..., ge=0, description="Total number of items in order")
    unique_items: int = Field(..., ge=0, description="Total number of unique items in order")
    notes: str | None = Field(None, description="Order notes from buyer")
    shipping_address: str | None = Field(None, description="Shipping address")
    
    items: list[OrderItemModel] = Field(default_factory=list, description="Order items")
    
    # tracking_number: str | None = Field(None, description="Shipping tracking number")


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
    tracking_number: str | None = Field(None, description="Tracking number (if shipped)")


class OrderList(BaseModel):
    """Paginated order list response"""
    
    orders: list[OrderSummary] = Field(default_factory=list, description="List of orders")
    total: int = Field(..., ge=0, description="Total number of orders")
    offset: int = Field(..., ge=0, description="Current offset")
    limit: int = Field(..., ge=1, description="Items per page")
