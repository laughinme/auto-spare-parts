from uuid import UUID

from fastapi import HTTPException

from core.config import Settings
from database.relational_db import (
    UoW,
    MakesInterface,
    Make,
)

settings = Settings() # type: ignore

class VehicleService:
    def __init__(
        self,
        uow: UoW,
        make_repo: MakesInterface,
    ):
        self.uow = uow
        self.make_repo = make_repo
        
    async def get_make(self, make_id: int) -> Make | None:
        return await self.make_repo.get_by_id(make_id)
    
    async def search(self, limit: int, search: str | None) -> list[Make]:
        return await self.make_repo.list(limit, search)
