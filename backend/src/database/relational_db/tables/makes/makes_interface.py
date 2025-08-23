from sqlalchemy import select, func, case, literal
from sqlalchemy.ext.asyncio import AsyncSession

from .makes_table import Make


class MakesInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: int) -> Make | None:
        return await self.session.scalar(select(Make).where(Make.make_id == id))

    async def list(
        self,
        limit: int = 20,
        search: str | None = None,
    ) -> list[Make]:
        stmt = select(Make)
            
        # Order by relevance if searching, otherwise alphabetical
        if search:
            stmt = stmt.where(Make.make_name.ilike(f"%{search}%"))
            
            # exact_match = func.lower(Make.make_name) == func.lower(literal(search))
            # prefix_match = func.lower(Make.make_name).like(func.lower(literal(f"{search}%")))
            # substring_match = func.lower(Make.make_name).like(func.lower(literal(f"%{search}%")))

            # relevance = case(
            #     (exact_match, 3),
            #     (prefix_match, 2),
            #     (substring_match, 1),
            #     else_=0,
            # )

            stmt = stmt.order_by(
                # relevance.desc(),
                func.char_length(Make.make_name),
                Make.make_name.asc(),
                Make.make_id.asc(),
            )
        else:
            stmt = stmt.order_by(Make.make_name.asc())

        stmt = stmt.limit(limit)
        rows = await self.session.scalars(stmt)
        return list(rows.all())
