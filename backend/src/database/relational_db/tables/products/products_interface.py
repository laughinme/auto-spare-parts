from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, or_, and_
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

    async def list_published_products(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
        search: str | None = None,
        brand: str | None = None,
        condition: str | None = None,
        price_min: float | None = None,
        price_max: float | None = None,
    ) -> tuple[list[Product], int]:
        """Get published products list with filters for public catalog"""
        stmt = select(Product).where(Product.status == ProductStatus.PUBLISHED)
        
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
        
        # Brand filter
        if brand:
            stmt = stmt.where(Product.brand.ilike(f"%{brand}%"))
            
        # Condition filter
        if condition:
            stmt = stmt.where(Product.condition == condition)
            
        # Price range filter
        if price_min is not None:
            stmt = stmt.where(Product.price >= price_min)
        if price_max is not None:
            stmt = stmt.where(Product.price <= price_max)
        
        # Count total items
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt)
        
        # Pagination and sorting (newest first for now)
        stmt = stmt.order_by(Product.created_at.desc()).offset(offset).limit(limit)
        rows = await self.session.scalars(stmt)
        
        return list(rows.all()), int(total or 0)

    async def get_feed_products_cursor(
        self,
        *,
        limit: int = 20,
        cursor_created_at: datetime | None = None,
        cursor_id: UUID | None = None,
    ) -> list[Product]:
        """Get products for feed using cursor pagination (same pattern as admin users)"""
        stmt = (
            select(Product)
            .where(Product.status == ProductStatus.PUBLISHED)
        )
        
        # Cursor pagination (created_at desc, id desc) - same as admin users
        if cursor_created_at is not None and cursor_id is not None:
            stmt = stmt.where(
                or_(
                    Product.created_at < cursor_created_at,
                    and_(Product.created_at == cursor_created_at, Product.id < cursor_id),
                )
            )
        
        stmt = stmt.order_by(Product.created_at.desc(), Product.id.desc()).limit(limit)
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def search_published_products_cursor(
        self,
        *,
        limit: int = 20,
        search: str | None = None,
        brand: str | None = None,
        condition: str | None = None,
        price_min: float | None = None,
        price_max: float | None = None,
        cursor_created_at: datetime | None = None,
        cursor_id: UUID | None = None,
    ) -> list[Product]:
        """Search published products with cursor pagination (same pattern as admin users)"""
        stmt = select(Product).where(Product.status == ProductStatus.PUBLISHED)
        
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
        
        # Brand filter
        if brand:
            stmt = stmt.where(Product.brand.ilike(f"%{brand}%"))
            
        # Condition filter
        if condition:
            stmt = stmt.where(Product.condition == condition)
            
        # Price range filter
        if price_min is not None:
            stmt = stmt.where(Product.price >= price_min)
        if price_max is not None:
            stmt = stmt.where(Product.price <= price_max)
        
        # Cursor pagination (created_at desc, id desc) - same as admin users
        if cursor_created_at is not None and cursor_id is not None:
            stmt = stmt.where(
                or_(
                    Product.created_at < cursor_created_at,
                    and_(Product.created_at == cursor_created_at, Product.id < cursor_id),
                )
            )
        
        stmt = stmt.order_by(Product.created_at.desc(), Product.id.desc()).limit(limit)
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def get_feed_products(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Product], int]:
        """Get products for feed (trending/popular products)"""
        # Simple implementation: latest published products
        # Later: add popularity scoring, user preferences, etc.
        stmt = (
            select(Product)
            .where(Product.status == ProductStatus.PUBLISHED)
            .order_by(Product.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        
        rows = await self.session.scalars(stmt)
        
        # Count total published products
        count_stmt = select(func.count()).where(Product.status == ProductStatus.PUBLISHED)
        total = await self.session.scalar(count_stmt)
        
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