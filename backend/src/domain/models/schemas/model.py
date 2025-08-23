from pydantic import BaseModel, Field


class ModelSchema(BaseModel):
    """Vehicle model representation for API responses."""
    
    model_id: int = Field(..., description="Unique identifier for the vehicle model")
    make_id: int = Field(..., description="Reference to the make this model belongs to")
    model_name: str = Field(..., description="Name of the vehicle model (e.g., 3 Series, Camry, Mustang)")


class GarageModelSchema(BaseModel):
    """Vehicle model representation for API responses."""
    
    model_id: int = Field(..., description="Unique identifier for the vehicle model")
    model_name: str = Field(..., description="Name of the vehicle model (e.g., 3 Series, Camry, Mustang)")
