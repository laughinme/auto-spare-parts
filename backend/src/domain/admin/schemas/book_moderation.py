from pydantic import BaseModel, Field


class ModerationReason(BaseModel):
    reason: str = Field(..., description='Cancel reason')
