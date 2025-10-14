from uuid import UUID
from datetime import datetime
from sqlalchemy import result_tuple, select, delete, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from .reviews_table import ProductReview


class ProductReviewsInterface:
    """Interface for working with products in database"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, product: ProductReview) -> ProductReview:
        """Add new review"""
        self.session.add(product)
        await self.session.flush()
        return product

    async def get_by_id(self, id: UUID | str) -> ProductReview | None:
        """Get review by ID"""
        return await self.session.scalar(
            select(ProductReview)
            .where(ProductReview.id == id)
        )
        
    async def update_review(
        self,
        review_id: UUID | str,
        rating: int,
        title: str | None = None,
        body: str | None = None,
    ) -> ProductReview | None:
        """Set review for product"""
        result = await self.session.execute(
            update(ProductReview)
            .values(rating=rating, title=title, body=body)
            .where(ProductReview.id == review_id)
            .returning(ProductReview)
        )
        return result.scalar()
        
    async def remove_rating(self, review_id: UUID | str) -> None:
        await self.session.execute(
            delete(ProductReview)
            .where(
                ProductReview.id == review_id
            )
        )
