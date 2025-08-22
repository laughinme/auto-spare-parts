from uuid import UUID

from fastapi import HTTPException

from core.config import Settings
from database.relational_db import (
    UoW,
    MakesInterface,
    Make,
    ModelsInterface,
    Model,
    YearsInterface,
    ModelYear,
)

settings = Settings() # type: ignore

class VehicleService:
    def __init__(
        self,
        uow: UoW,
        make_repo: MakesInterface,
        model_repo: ModelsInterface,
        year_repo: YearsInterface,
    ):
        self.uow = uow
        self.make_repo = make_repo
        self.model_repo = model_repo
        self.year_repo = year_repo
        
    async def get_make(self, make_id: int) -> Make | None:
        return await self.make_repo.get_by_id(make_id)
    
    async def search_makes(
        self,
        limit: int,
        search: str | None,
    ) -> list[Make]:
        return await self.make_repo.list(limit, search)

    async def search_models(
        self,
        limit: int,
        make_id: int | None,
        search: str | None,
    ) -> list[Model]:
        return await self.model_repo.list(limit, make_id, search)


    async def list_years(
        self,
        model_id: int,
    ) -> list[int]:
        return await self.year_repo.list(model_id)
