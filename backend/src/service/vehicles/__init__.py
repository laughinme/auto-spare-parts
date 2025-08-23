from fastapi import Depends

from database.relational_db import (
    get_uow,
    UoW,
    MakesInterface,
    ModelsInterface,
    YearsInterface,
)
from .vehicles_service import VehicleService


async def get_vehicle_service(
    uow: UoW = Depends(get_uow),
) -> VehicleService:
    make_repo = MakesInterface(uow.session)
    model_repo = ModelsInterface(uow.session)
    year_repo = YearsInterface(uow.session)
    return VehicleService(uow, make_repo, model_repo, year_repo)
