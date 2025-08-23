from typing import Annotated
from fastapi import APIRouter, Depends, Query

from domain.makes import MakeModel
from service.vehicles import VehicleService, get_vehicle_service

router = APIRouter()

@router.get(
    path='/',
    response_model=list[MakeModel],
    summary='Get all makes'
)
async def list_makes(
    svc: Annotated[VehicleService, Depends(get_vehicle_service)],
    limit: int = Query(50, ge=1, le=100),
    search: str | None = Query(None),
):
    return await svc.search_makes(limit, search)
