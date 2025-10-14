from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from core.security import auth_user
from domain.orders import OrderItemModel, ConfirmDelivery
from database.relational_db import User
from service.orders import OrderService, get_order_service

router = APIRouter()


@router.post(
    '/confirm_delivery',
    status_code=201,
    response_model=OrderItemModel,
    description="Confirm the delivery of the order item."
)
async def place_review(
    order_id: UUID,
    item_id: UUID,
    payload: ConfirmDelivery,
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
):
    review = await order_svc.confirm_delivery(payload, order_id, item_id, user)
    
    return review
