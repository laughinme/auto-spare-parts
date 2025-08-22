from uuid import UUID
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from .garage_table import GarageVehicle
from ..makes.makes_table import Make
from ..models.models_table import Model
from ..vehicles.vehicle_types_table import VehicleType


class GarageVehiclesInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def search(self, search: str, limit: int, user_id: UUID | None = None) -> list[GarageVehicle]:
        stmt = select(GarageVehicle)

        if user_id:
            stmt = stmt.where(GarageVehicle.user_id == user_id)

        if search:
            stmt = stmt.join(Make, GarageVehicle.make_id == Make.make_id)
            stmt = stmt.join(Model, GarageVehicle.model_id == Model.model_id)
            stmt = stmt.outerjoin(VehicleType, GarageVehicle.vehicle_type_id == VehicleType.vehicle_type_id)
            
            stmt = (
                stmt.where(
                    or_(
                        Make.make_name.ilike(f"%{search}%"),
                        Model.model_name.ilike(f"%{search}%"),
                        VehicleType.name.ilike(f"%{search}%"),
                    )
                )
                .order_by(func.char_length(Make.make_name))
            )

        stmt = stmt.limit(limit)

        vehicles = await self.session.scalars(stmt)
        return list(vehicles.all())

    async def add(self, vehicle: GarageVehicle) -> None:
        self.session.add(vehicle)
    
    async def get_by_id(self, id: UUID | str) -> GarageVehicle | None:
        return await self.session.get(GarageVehicle, id)
