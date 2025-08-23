from typing import Annotated
from fastapi import APIRouter, Depends, Query

from database.relational_db import User
from domain.garage import VehilceModel, VehicleCreate, VehiclePatch
from core.security import auth_user
from service.garages import GarageService, get_garage_service

router = APIRouter()

@router.post(
    path='/add-vehicle',
    response_model=VehilceModel,
    summary='Add a new vehicle to the garage'
)
async def create_garage(
    payload: VehicleCreate,
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[GarageService, Depends(get_garage_service)],
):
    vehicle = await svc.add_vehicle(payload, user)
    return vehicle
