from pydantic import BaseModel, Field


class MakeModel(BaseModel):
    """Vehicle make model for API responses representing car manufacturers/brands."""
    
    make_id: int = Field(..., description="vPIC make identifier")
    make_name: str = Field(..., description="Official make name (e.g., BMW, Toyota, Ford)")
