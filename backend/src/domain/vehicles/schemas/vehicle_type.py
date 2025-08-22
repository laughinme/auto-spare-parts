from pydantic import BaseModel, Field

from ...common.timestamps import TimestampModel


class VehicleTypeModel(BaseModel):
    """Vehicle type model for API responses representing different vehicle categories."""
    
    vehicle_type_id: int = Field(..., description="Unique identifier for the vehicle type")
    name: str = Field(..., description="Vehicle type name (e.g., sedan, SUV, truck)")
