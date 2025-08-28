from fastapi import Depends

from database.relational_db import (
    get_uow,
    UoW,
    CartInterface,
    OrderInterface,
    OrderItemInterface,
    CartItemInterface,
)
from .order_service import OrderService


async def get_order_service(
    uow: UoW = Depends(get_uow),
) -> OrderService:
    """Dependency to get order service with all required repositories"""
    cart_repo = CartInterface(uow.session)
    cart_item_repo = CartItemInterface(uow.session)
    order_repo = OrderInterface(uow.session)
    order_item_repo = OrderItemInterface(uow.session)

    return OrderService(uow, cart_repo, cart_item_repo, order_repo, order_item_repo)
