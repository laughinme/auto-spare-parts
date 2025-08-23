from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .model_years_table import ModelYear


class YearsInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: int) -> ModelYear | None:
        return await self.session.scalar(
            select(ModelYear).where(ModelYear.model_id == id)
        )

    async def list(
        self,
        model_id: int,
    ) -> list[int]:
        stmt = (
            select(ModelYear.year)
            .where(ModelYear.model_id == model_id)
            .order_by(ModelYear.year.desc())
        )

        rows = await self.session.scalars(stmt)
        return list(rows.all())
    
    # async def list(
    #     self,
    #     model_id: int,
    # ) -> list[int]:
    #     stmt = (
    #         select(ModelYear.year)
    #         .where(ModelYear.model_id == model_id)
    #         .order_by(ModelYear.year.desc())
    #     )

    #     rows = await self.session.scalars(stmt)
    #     return list(rows.all())
