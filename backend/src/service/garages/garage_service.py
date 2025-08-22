from uuid import UUID
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from database.relational_db import (
    UoW, 
    User,
    GarageVehicle,
    GarageVehiclesInterface
)
from domain.garage import VehicleCreate


class GarageService:
    def __init__(
        self, 
        uow: UoW,
        gv_repo: GarageVehiclesInterface
    ):
        self.uow = uow
        self.gv_repo = gv_repo

    async def add_vehicle(self, vehicle: VehicleCreate, user: User) -> GarageVehicle:
        new_vehicle = GarageVehicle(**vehicle.model_dump(), user_id=user.id)
        try:
            await self.gv_repo.add(new_vehicle)
            await self.uow.commit()
            await self.uow.session.refresh(new_vehicle)
            return new_vehicle
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_by_id(self, vehicle_id: UUID | str) -> GarageVehicle | None:
        return await self.gv_repo.get_by_id(vehicle_id)

    async def search_vehicles(self, search: str, limit: int, user_id: UUID | None = None) -> list[GarageVehicle]:
        return await self.gv_repo.search(search, limit, user_id)
