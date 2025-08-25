from uuid import UUID
from pydantic import BaseModel, Field

from ..enums import OrganizationType, KycStatus, PayoutSchedule
from ...common.timestamps import TimestampModel

class OrganizationModel(TimestampModel):
    id: UUID = Field(..., description="Unique identifier for the organization")
    type: OrganizationType = Field(..., description="Type of organization (supplier, workshop, etc.)")
    name: str = Field(..., description="Organization name")
    country: str = Field(..., description="2-letter country code")
    address: str | None = Field(None, description="Organization address")
    
    stripe_account_id: str | None = Field(None, description="Stripe Connect account ID")
    kyc_status: KycStatus = Field(..., description="Know Your Customer verification status")
    payout_schedule: PayoutSchedule = Field(..., description="How often payouts are processed")
    
    # Stripe snapshots trimmed for MVP; UI assumes successful onboarding
    
class OrganizationShare(BaseModel):
    id: UUID = Field(..., description="Unique identifier for the organization")
    name: str = Field(..., description="Organization name")
    country: str = Field(..., description="2-letter country code")
    address: str | None = Field(None, description="Organization address")

class OrganizationCreate(BaseModel):
    name: str = Field(..., description="Organization name")
    country: str = Field(..., description="Organization country (2-letter code)")
    address: str = Field(..., description="Organization address")
    
    payout_schedule: PayoutSchedule | None = Field(None, description="Payout schedule preference")


class OrganizationPatch(BaseModel):
    name: str | None = Field(None, description="Organization name")
    country: str | None = Field(None, description="Organization country (2-letter code)")
    address: str | None = Field(None, description="Organization address")
    payout_schedule: PayoutSchedule | None = Field(None, description="Payout schedule preference")
