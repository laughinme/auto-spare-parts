from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends

from core.security import auth_user
from database.relational_db import User
from domain.orders import SellerOrderItemModel
from service.orders import SellerOrderService, get_seller_order_service

router = APIRouter()


@router.get(
    '/',
    response_model=SellerOrderItemModel,
    summary='Get seller order item details',
)
async def get_seller_order_item(
    order_item_id: UUID,
    user: Annotated[User, Depends(auth_user)],
    seller_order_svc: Annotated[SellerOrderService, Depends(get_seller_order_service)],
) -> SellerOrderItemModel:
    return await seller_order_svc.get_item(user=user, item_id=order_item_id)
