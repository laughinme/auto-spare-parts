from typing import Annotated
from fastapi import APIRouter, Depends

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


@router.get(
    path='/vehicles',
    response_model=list[VehilceModel],
    summary='List all vehicles in the garage'
)
async def list_vehicles(
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[GarageService, Depends(get_garage_service)],
    search: str = "",
    limit: int = 50,
):
    """List all vehicles in the user's garage with optional search functionality."""
    vehicles = await svc.search_vehicles(search=search, limit=limit, user_id=user.id)
    return vehicles
