from fastapi import Depends

from database.relational_db import (UoW, get_uow, GarageVehiclesInterface)
from .garage_service import GarageService


async def get_garage_service(
    uow: UoW = Depends(get_uow),
) -> GarageService:
    garage_repo = GarageVehiclesInterface(uow.session)
    return GarageService(uow, garage_repo)
