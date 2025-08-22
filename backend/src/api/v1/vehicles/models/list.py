from typing import Annotated
from fastapi import APIRouter, Depends, Query

from domain.models import ModelSchema
from service.vehicles import VehicleService, get_vehicle_service

router = APIRouter()

@router.get(
    path='/',
    response_model=list[ModelSchema],
    summary='Get all models'
)
async def list_models(
    svc: Annotated[VehicleService, Depends(get_vehicle_service)],
    limit: int = Query(50, ge=1, le=100),
    make_id: int | None = Query(None),
    search: str | None = Query(None),
):
    return await svc.search_models(limit, make_id, search)
