from fastapi import Depends

from database.relational_db import (
    get_uow,
    UoW,
    UserInterface,
)
from .statistics_service import StatService


async def get_stats_service(
    uow: UoW = Depends(get_uow),
) -> StatService:
    user_repo = UserInterface(uow.session)
    
    return StatService(uow, user_repo)
