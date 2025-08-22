from fastapi import Depends

from database.relational_db import (
    get_uow,
    UoW,
    MakesInterface,
)
from .vehicles_service import VehicleService


async def get_vehicle_service(
    uow: UoW = Depends(get_uow),
) -> VehicleService:
    make_repo = MakesInterface(uow.session)
    return VehicleService(uow, make_repo)
