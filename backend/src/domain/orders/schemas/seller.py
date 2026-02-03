from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl

from .order import OrderItemModel
from ...payments import PaymentStatus


class SellerBuyerPreview(BaseModel):
    """Minimal buyer information shared with sellers."""

    id: UUID = Field(..., description="Buyer user ID")
    email: str | None = Field(None, description="Buyer email for contact purposes")
    username: str | None = Field(None, description="Buyer display name")


class SellerOrderItemModel(OrderItemModel):
    """Order item representation tailored for sellers."""

    order_reference: str = Field(..., description="Short reference code for the parent order")
    order_created_at: datetime = Field(..., description="Datetime when the parent order was created")
    payment_status: PaymentStatus = Field(..., description="Payment status of the parent order")
    shipping_address: str | None = Field(None, description="Order shipping address")
    buyer: SellerBuyerPreview = Field(..., description="Buyer summary information")
    notes: str | None = Field(None, description="Notes provided by the buyer during checkout")


class SellerOrderItemShipPayload(BaseModel):
    carrier_code: str = Field(..., description="Carrier code or name visible to the seller", min_length=1, max_length=64)
    tracking_number: str = Field(..., description="Tracking number provided by the carrier", min_length=1, max_length=128)
    tracking_url: HttpUrl | None = Field(None, description="Direct tracking URL")
    shipped_at: datetime | None = Field(None, description="Timestamp when the parcel was shipped")


class SellerOrderItemDeliverPayload(BaseModel):
    delivered_at: datetime | None = Field(None, description="Timestamp when the parcel was delivered")


class SellerOrderItemRejectPayload(BaseModel):
    reason: str | None = Field(None, description="Optional reason shared with the buyer")
