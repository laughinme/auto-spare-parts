from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models_table import Model


class ModelsInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: int) -> Model | None:
        return await self.session.scalar(
            select(Model).where(Model.model_id == id)
        )

    async def list(
        self,
        limit: int = 20,
        make_id: int | None = None,
        search: str | None = None,
    ) -> list[Model]:
        stmt = select(Model)

        if make_id:
            stmt = stmt.where(Model.make_id == make_id)
            
        # Order by relevance if searching, otherwise alphabetical
        if search:
            stmt = stmt.where(Model.model_name.ilike(f"%{search}%"))

            stmt = stmt.order_by(
                func.char_length(Model.model_name),
                Model.model_name.asc(),
                Model.model_id.asc(),
            )
        else:
            stmt = stmt.order_by(Model.model_name.asc())

        stmt = stmt.limit(limit)
        rows = await self.session.scalars(stmt)
        return list(rows.all())
