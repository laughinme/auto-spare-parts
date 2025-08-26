from fastapi import Depends
from redis.asyncio import Redis

from database.redis import get_redis
from database.relational_db import (
    UoW,
    get_uow,
    ProductsInterface,
    ProductMediaInterface,
    CartItemInterface,
)
from .product_service import ProductService


async def get_product_service(
    uow: UoW = Depends(get_uow),
    redis: Redis = Depends(get_redis),
) -> ProductService:
    """Factory for creating ProductService with dependencies"""
    products_repo = ProductsInterface(uow.session)
    media_repo = ProductMediaInterface(uow.session)
    carts_repo = CartItemInterface(uow.session)
    return ProductService(uow, products_repo, media_repo, carts_repo, redis=redis)
