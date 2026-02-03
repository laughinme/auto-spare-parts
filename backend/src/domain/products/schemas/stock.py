from pydantic import BaseModel, Field, field_validator


class AdjustStock(BaseModel):
    """Adjust product stock model"""
    delta: int = Field(..., description="Quantity to adjust")
    reason: str | None = Field(None, description="Reason for adjustment")
    
    @field_validator("delta")
    @classmethod
    def validate_delta(cls, v: int) -> int:
        if v == 0:
            raise ValueError("Delta must be non-zero")
        return v
