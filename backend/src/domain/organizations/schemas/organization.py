from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from ..enums import OrganizationType, KycStatus, PayoutSchedule
from ...common.timestamps import TimestampModel

class OrganizationModel(TimestampModel):
    """Organization model for API responses."""
    
    id: UUID = Field(..., description="Unique identifier for the organization")
    type: OrganizationType = Field(..., description="Type of organization (supplier, workshop, etc.)")
    name: str = Field(..., description="Organization name")
    country: str = Field(..., description="2-letter country code")
    address: str = Field(..., description="Organization address")
    owner_user_id: UUID = Field(..., description="ID of the user who owns this organization")
    stripe_account_id: Optional[str] = Field(None, description="Stripe Connect account ID")
    kyc_status: KycStatus = Field(..., description="Know Your Customer verification status")
    payout_schedule: PayoutSchedule = Field(..., description="How often payouts are processed")
    

class OrganizationCreate(BaseModel):
    """Organization creation model for API requests."""
    
    # Required fields for organization creation
    name: str = Field(..., description="Organization name")
    country: str = Field(..., description="Organization country (2-letter code)")
    address: str = Field(..., description="Organization address")
    
    # Optional fields
    payout_schedule: Optional[PayoutSchedule] = Field(None, description="Payout schedule preference")


class OrganizationPatch(BaseModel):
    """Organization patch model for partial updates."""
    
    name: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    payout_schedule: Optional[PayoutSchedule] = None
