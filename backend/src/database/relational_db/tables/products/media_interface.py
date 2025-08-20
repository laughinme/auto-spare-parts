from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .products_table import ProductMedia


class ProductMediaInterface:
    """Interface for working with product media files"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, media: ProductMedia) -> ProductMedia:
        """Add media file to session"""
        self.session.add(media)
        return media

    async def list_by_product(self, product_id: UUID | str) -> list[ProductMedia]:
        """Get all media files for product"""
        rows = await self.session.scalars(select(ProductMedia).where(ProductMedia.product_id == product_id))
        return list(rows.all())

    async def get_by_id(self, id: UUID | str) -> ProductMedia | None:
        """Get media file by ID"""
        return await self.session.scalar(select(ProductMedia).where(ProductMedia.id == id))

    async def delete(self, id: UUID | str) -> None:
        """Delete media file"""
        media = await self.get_by_id(id)
        if media is None:
            return
        await self.session.delete(media)


