from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

from ..enums import MembershipRole
from ...users.schemas.shareable import UserBrief


class OrgMembershipBrief(BaseModel):
    role: MembershipRole = Field(..., description="Role of the user in the organization")
    accepted_at: datetime | None = Field(None, description="Date and time when the user accepted the invitation")

class OrgMembershipModel(BaseModel):
    org_id: UUID = Field(..., description="Unique identifier for the organization")
    user_id: UUID = Field(..., description="Unique identifier for the user")
    role: MembershipRole = Field(..., description="Role of the user in the organization")
    invited_by: UserBrief | None = Field(None, description="User who invited the user to the organization")
    invited_at: datetime | None = Field(None, description="Date and time when the user was invited to the organization")
    accepted_at: datetime | None = Field(None, description="Date and time when the user accepted the invitation")
