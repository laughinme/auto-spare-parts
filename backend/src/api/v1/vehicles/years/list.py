from typing import Annotated
from fastapi import APIRouter, Depends, Query

from domain.models import ModelSchema
from service.vehicles import VehicleService, get_vehicle_service

router = APIRouter()

@router.get(
    path='/',
    response_model=list[int],
    summary='Get all years for model'
)
async def list_years(
    svc: Annotated[VehicleService, Depends(get_vehicle_service)],
    model_id: int = Query(...),
):
    return await svc.list_years(model_id)
