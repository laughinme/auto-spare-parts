from uuid import UUID
from pydantic import BaseModel, Field

from ...common.timestamps import TimestampModel
from ...makes.schemas.make import MakeModel
from ...models.schemas.model import ModelSchema
from ...vehicles.schemas.vehicle_type import VehicleTypeModel


class VehilceModel(TimestampModel):
    id: UUID = Field(..., description="Unique identifier for the garage entry")
    user_id: UUID = Field(..., description="User who owns this vehicle")
    make: MakeModel = Field(..., description="Vehicle make")
    model: ModelSchema = Field(..., description="Vehicle model")
    year: int = Field(..., description="Vehicle year")
    vehicle_type: VehicleTypeModel | None = Field(None, description="Vehicle type") 
    vin: str | None = Field(None, description="Vehicle identification number")
    # vin_decoded: dict | None = Field(None, description="Decoded VIN information")
    comment: str | None = Field(None, description="User comment about the vehicle")
    
    

class VehicleCreate(BaseModel):
    """Garage creation model for API requests."""
    
    make_id: int = Field(..., description="Vehicle make identifier")
    model_id: int = Field(..., description="Vehicle model identifier")
    year: int = Field(..., description="Vehicle year")
    vehicle_type_id: int | None = Field(None, description="Vehicle type identifier")
    vin: str | None = Field(None, description="Vehicle identification number")
    comment: str | None = Field(None, description="User comment about the vehicle")


class VehiclePatch(BaseModel):
    """Garage patch model for partial updates."""
    
    make_id: int | None = Field(None, description="Vehicle make identifier")
    model_id: int | None = Field(None, description="Vehicle model identifier")
    year: int | None = Field(None, description="Vehicle year")
    vehicle_type_id: int | None = Field(None, description="Vehicle type identifier")
    vin: str | None = Field(None, description="Vehicle identification number")
    comment: str | None = Field(None, description="User comment about the vehicle")
