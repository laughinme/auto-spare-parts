from datetime import datetime
from typing import Annotated
from uuid import UUID
from pydantic import BaseModel, Field, AwareDatetime


class PrepareCheckout(BaseModel):
    """Schema for preparing checkout"""
    
    cart_item_ids: list[UUID] = Field(
        default_factory=list,
        # min_length=1,
        # description="List of cart item UUIDs to checkout (must contain at least one item)",
        description="List of cart item UUIDs to checkout. If empty, all the items in the cart will be checked out."
    )
    shipping_address: str = Field(..., description="Shipping address. (string now, but it'll be separate model later)")
    notes: str | None = Field(None, description="Order notes from buyer")
    # cart_updated_at: AwareDatetime = Field(..., description="Current UI cart updated at.")


class PrepareCheckoutResponse(BaseModel):
    order_id: UUID
    client_secret: str

class PrepareCheckoutStripeHostedResponse(BaseModel):
    order_id: UUID
    url: str
