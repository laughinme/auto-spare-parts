from fastapi import Depends
from redis.asyncio import Redis

from database.relational_db import UoW, get_uow
from database.redis.redis_client import get_redis
from database.relational_db.tables.products import (
    ProductsInterface,
    ProductMediaInterface,
)
from .product_service import ProductService


async def get_product_service(
    uow: UoW = Depends(get_uow),
    redis: Redis = Depends(get_redis),
) -> ProductService:
    """Factory for creating ProductService with dependencies"""
    products_repo = ProductsInterface(uow.session)
    media_repo = ProductMediaInterface(uow.session)
    return ProductService(uow, products_repo, media_repo, redis=redis)
