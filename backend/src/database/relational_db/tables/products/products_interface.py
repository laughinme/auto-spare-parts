from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from .products_table import Product
from domain.products.enums.status import ProductStatus


class ProductsInterface:
    """Interface for working with products in database"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, product: Product) -> Product:
        """Add new product to session"""
        self.session.add(product)
        return product

    async def get_by_id(self, id: UUID | str) -> Product | None:
        """Get product by ID"""
        return await self.session.scalar(select(Product).where(Product.id == id))

    async def list_by_org(
        self,
        org_id: UUID | str,
        *,
        offset: int = 0,
        limit: int = 20,
        status: ProductStatus | None = None,
        search: str | None = None,
    ) -> tuple[list[Product], int]:
        """Get organization products list with filters and pagination"""
        stmt = select(Product).where(Product.org_id == org_id)
        
        # Filter by status
        if status is not None:
            stmt = stmt.where(Product.status == status)
            
        # Text search (brand, part number, description)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Product.brand.ilike(pattern),
                    Product.part_number.ilike(pattern),
                    Product.description.ilike(pattern)
                )
            )
        
        # Count total items
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt)
        
        # Pagination and sorting
        stmt = stmt.order_by(Product.created_at.desc()).offset(offset).limit(limit)
        rows = await self.session.scalars(stmt)
        
        return list(rows.all()), int(total or 0)

    async def update_fields(self, id: UUID | str, **updates) -> None:
        """Update product fields"""
        product = await self.get_by_id(id)
        if product is None:
            return
        for key, value in updates.items():
            setattr(product, key, value)
        await self.session.flush()

    async def delete(self, id: UUID | str) -> None:
        """Delete product"""
        product = await self.get_by_id(id)
        if product is None:
            return
        await self.session.delete(product)


