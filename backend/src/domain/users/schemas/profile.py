from typing import Annotated
from pydantic import BaseModel, Field, EmailStr, HttpUrl, constr, ConfigDict
from uuid import UUID

from domain.common import TimestampModel
from domain.organizations import OrganizationModel

class UserModel(TimestampModel):
    """User account representation."""
    # Configure ORM conversion and drop fields set to their defaults during serialization.
    # model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID = Field(...)
    email: EmailStr = Field(..., description="User e-mail")
    
    organization: OrganizationModel | None = Field(None, description="User's organization")
    
    username: str | None = Field(None, description="User's display name")
    profile_pic_url: HttpUrl | None = Field(None)
    bio: str | None = Field(None)
    language_code: Annotated[str, constr(min_length=2, max_length=2)] | None = Field(None)
    
    is_onboarded: bool
    banned: bool
    
    # TODO: Add roles list
    # Roles list is intentionally optional so it is omitted unless expansion is requested.
    # roles: list[str] | None = Field(
    #     default=None,
    #     description="User's roles. Present only when ?expand=roles"
    # )

class UserPatch(BaseModel):
    username: str | None = Field(None, description="User's display name")
    profile_pic_url: str | None = Field(None)
    bio: str | None = Field(None)
    language_code: Annotated[str, constr(min_length=2, max_length=2)] | None = Field(None)
