from datetime import datetime
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator

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
    seller_organization: OrganizationShare = Field(..., description="Seller organization details")

    carrier_code: str | None = Field(None, description="Carrier code or short name")
    tracking_number: str | None = Field(None, description="Tracking number for this item")
    tracking_url: str | None = Field(None, description="Tracking URL provided by the carrier")
    shipped_at: datetime | None = Field(None, description="Datetime when the item was marked as shipped")
    delivered_at: datetime | None = Field(None, description="Datetime when the item was marked as delivered")


class OrderModel(TimestampModel):
    """Order model for API responses"""

    id: UUID = Field(..., description="Unique order ID")
    buyer_id: UUID = Field(..., description="Buyer user ID")
    
    # Order details
    payment_status: PaymentStatus = Field(..., description="Order payment status")
    total_amount: Decimal = Field(..., ge=0, description="Total order amount in USD")
    total_items: int = Field(..., ge=0, description="Total number of items in order")
    unique_items: int = Field(..., ge=0, description="Total number of unique items in order")
    order_progress: int = Field(..., ge=0, description="Order progress")
    
    notes: str | None = Field(None, description="Order notes from buyer")
    shipping_address: str | None = Field(None, description="Shipping address")
    
    items: list[OrderItemModel] = Field(default_factory=list, description="Order items")

    shipped_items: int = Field(0, description="Number of items that have been shipped")
    delivered_items: int = Field(0, description="Number of items that have been delivered")

    @model_validator(mode='after')
    def _populate_progress(self) -> "OrderModel":
        self.shipped_items = sum(
            1 for item in self.items if item.status in {OrderStatus.SHIPPED, OrderStatus.DELIVERED}
        )
        self.delivered_items = sum(1 for item in self.items if item.status == OrderStatus.DELIVERED)
        return self


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
