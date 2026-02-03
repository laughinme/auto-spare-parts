from uuid import UUID
from pydantic import BaseModel, Field


class LeaveReview(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Review rating")
    title: str | None = Field(None, max_length=255, description="Review title")
    body: str | None = Field(None, max_length=1000, description="Review body")


class ReviewModel(BaseModel):
    id: UUID = Field(..., description="Review ID")
    order_item_id: UUID = Field(..., description="Order item ID")
    product_id: UUID = Field(..., description="Product ID")
    seller_org_id: UUID = Field(..., description="Seller organization ID")
    reviewer_user_id: UUID = Field(..., description="Reviewer user ID")
    rating: int = Field(..., ge=1, le=5, description="Review rating")
    title: str | None = Field(None, max_length=255, description="Review title")
    body: str | None = Field(None, max_length=1000, description="Review body")
