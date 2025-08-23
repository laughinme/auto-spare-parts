from pydantic import BaseModel, Field


class BanRequest(BaseModel):
    banned: bool = Field(..., description='Set banned flag')
