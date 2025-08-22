from typing import Annotated
from fastapi import APIRouter, Depends, Query

from database.relational_db import User
from domain.garage import VehilceModel
from domain.common import CursorPage
from core.security import auth_user
from service.garages import GarageService, get_garage_service

router = APIRouter()


@router.get(
    path='/vehicles',
    response_model=CursorPage[VehilceModel],
    summary='List user vehicles with cursor pagination and filters'
)
async def list_vehicles_cursor(
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[GarageService, Depends(get_garage_service)],
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    cursor: str | None = Query(None, description="Simple cursor"),
    search: str | None = Query(None, description="Search query (by make, model, vehicle type, comment)"),
    make_id: int | None = Query(None, description="Filter by make ID"),
    model_id: int | None = Query(None, description="Filter by model ID"),
):
    vehicles, next_cursor = await svc.search(
        user_id=user.id,
        limit=limit,
        search=search,
        make_id=make_id,
        model_id=model_id,
        cursor=cursor,
    )
    
    return CursorPage(items=vehicles, next_cursor=next_cursor)
