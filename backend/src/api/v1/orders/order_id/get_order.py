from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from core.security import auth_user
from domain.orders import OrderModel
from database.relational_db import User
from service.orders import OrderService, get_order_service

router = APIRouter()


@router.get(
    '/',
    response_model=OrderModel,
    description="List user's orders. By default returns orders with all statuses."
)
async def get_order(
    order_id: UUID,
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
):
    order = await order_svc.get_order(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order
