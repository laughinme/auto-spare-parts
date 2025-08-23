from uuid import UUID
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from database.relational_db import (
    UoW, 
    User,
    GarageVehicle,
    GarageVehiclesInterface
)
from domain.garage import VehicleCreate, VehiclePatch

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
            raise HTTPException(400, detail=str(e))

    async def get_vehicle(self, vehicle_id: UUID | str, user: User) -> GarageVehicle:
        vehicle = await self.gv_repo.get_by_id(vehicle_id)
        if vehicle is None:
            raise HTTPException(404, detail='Vehicle with this id not found')
        if vehicle.user_id != user.id:
            raise HTTPException(403, detail='You are not allowed to access this vehicle')
        return vehicle
    
    async def patch_vehicle(
        self, 
        payload: VehiclePatch, 
        vehicle_id: UUID | str, 
        user: User
    ) -> GarageVehicle:
        vehicle = await self.gv_repo.patch(vehicle_id, payload.model_dump(exclude_unset=True))
        if vehicle is None:
            raise HTTPException(404, detail='Vehicle with this id not found')
        if vehicle.user_id != user.id:
            await self.uow.session.rollback()
            raise HTTPException(403, detail='You are not allowed to access this vehicle')
        
        await self.uow.commit()
        await self.uow.session.refresh(vehicle)
        return vehicle

    async def search(
        self,
        user_id: UUID,
        *,
        limit: int = 20,
        search: str | None = None,
        make_id: int | None = None,
        model_id: int | None = None,
        cursor: str | None = None,
    ) -> tuple[list[GarageVehicle], str | None]:
        cursor_created_at = None
        cursor_id = None
        if cursor:
            try:
                ts_str, id_str = cursor.split("_", 1)
                cursor_created_at = datetime.fromisoformat(ts_str)
                cursor_id = UUID(id_str)
            except Exception:
                raise HTTPException(400, detail='Invalid cursor')

        vehicles = await self.gv_repo.search(
            user_id=user_id,
            limit=limit,
            search=search,
            make_id=make_id,
            model_id=model_id,
            cursor_created_at=cursor_created_at,
            cursor_id=cursor_id,
        )

        next_cursor = None
        if len(vehicles) == limit:
            last = vehicles[-1]
            if last.created_at is None:
                next_cursor = None
            else:
                next_cursor = f"{last.created_at.isoformat()}_{last.id}"

        return vehicles, next_cursor

    async def delete_vehicle(self, vehicle_id: UUID | str, user: User) -> None:
        vehicle = await self.gv_repo.delete(vehicle_id)
        if vehicle is None:
            raise HTTPException(404, detail='Vehicle with this id not found')
        if vehicle.user_id != user.id:
            await self.uow.session.rollback()
            raise HTTPException(403, detail='You are not allowed to delete this vehicle')
