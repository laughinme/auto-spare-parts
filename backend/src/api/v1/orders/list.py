from typing import Annotated
from fastapi import APIRouter, Depends, Query

from core.security import auth_user
from domain.orders import OrderStatus, OrderModel
from domain.payments import PaymentStatus, OrderBy
from domain.common import CursorPage
from database.relational_db import User
from service.orders import OrderService, get_order_service
from service.payments import StripeService, get_stripe_service

router = APIRouter()


@router.get(
    '/',
    response_model=CursorPage[OrderModel],
    description="List user's orders. By default returns orders with all statuses."
)
async def list_orders(
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
    statuses: Annotated[list[PaymentStatus], Query(default_factory=list, description="The status of the orders to list")],
    order_by: OrderBy = Query(default=OrderBy.CREATED_AT_DESC, description="The order by which to list the orders"),
    cursor: str | None  = Query(default=None, description="The cursor to list the next orders"),
    limit: int = Query(default=20, ge=1, le=100, description="The number of orders to list"),
):
    orders, next_cursor = await order_svc.get_user_orders(user, cursor=cursor, limit=limit, statuses=statuses, order_by=order_by)
    
    return CursorPage(items=orders, next_cursor=next_cursor)
