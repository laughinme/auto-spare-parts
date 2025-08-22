from uuid import UUID
from datetime import datetime
from sqlalchemy import select, or_, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .garage_table import GarageVehicle
from ..makes.makes_table import Make
from ..models.models_table import Model
from ..vehicles.vehicle_types_table import VehicleType


class GarageVehiclesInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def search(
        self,
        user_id: UUID,
        *,
        limit: int = 20,
        search: str | None = None,
        make_id: int | None = None,
        model_id: int | None = None,
        cursor_created_at: datetime | None = None,
        cursor_id: UUID | None = None,
    ) -> list[GarageVehicle]:
        stmt = (
            select(GarageVehicle)
            .where(GarageVehicle.user_id == user_id)
            .join(Make, GarageVehicle.make_id == Make.make_id)
        )
        
        if make_id is not None:
            stmt = stmt.where(GarageVehicle.make_id == make_id)
        if model_id is not None:
            stmt = stmt.where(GarageVehicle.model_id == model_id)
        
        if search:
            # Additional joins for search
            stmt = stmt.join(Model, GarageVehicle.model_id == Model.model_id)
            stmt = stmt.outerjoin(VehicleType, GarageVehicle.vehicle_type_id == VehicleType.vehicle_type_id)
            
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Make.make_name.ilike(pattern),
                    Model.model_name.ilike(pattern),
                    VehicleType.name.ilike(pattern),
                    GarageVehicle.comment.ilike(pattern),
                )
            )
        
        if cursor_created_at is not None and cursor_id is not None:
            stmt = stmt.where(
                or_(
                    GarageVehicle.created_at < cursor_created_at,
                    and_(GarageVehicle.created_at == cursor_created_at, GarageVehicle.id < cursor_id),
                )
            )
        
        stmt = stmt.order_by(
            func.char_length(Make.make_name),
            GarageVehicle.created_at.desc(), 
            GarageVehicle.id.desc()
        ).limit(limit)
        
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def add(self, vehicle: GarageVehicle) -> None:
        self.session.add(vehicle)
    
    async def get_by_id(self, id: UUID | str) -> GarageVehicle | None:
        return await self.session.get(GarageVehicle, id)
