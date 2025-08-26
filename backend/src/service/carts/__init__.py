from fastapi import Depends

from database.relational_db import (
    get_uow,
    UoW,
    CartInterface,
    CartItemInterface,
    ProductsInterface,
)
from .cart_service import CartService


async def get_cart_service(
    uow: UoW = Depends(get_uow),
) -> CartService:
    """Dependency to get cart service with all required repositories"""
    cart_repo = CartInterface(uow.session)
    cart_item_repo = CartItemInterface(uow.session)
    product_repo = ProductsInterface(uow.session)
    
    return CartService(uow, cart_repo, cart_item_repo, product_repo)
