from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query

from database.relational_db import User
from domain.garage import VehilceModel, VehicleCreate, VehiclePatch
from core.security import auth_user
from service.garages import GarageService, get_garage_service

router = APIRouter()

@router.delete(
    path='/',
    status_code=204,
    summary='Delete a vehicle from the garage'
)
async def delete_vehicle(
    vehicle_id: UUID,
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[GarageService, Depends(get_garage_service)],
):
    await svc.delete_vehicle(vehicle_id, user)
