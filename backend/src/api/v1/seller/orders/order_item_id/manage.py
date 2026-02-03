from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends

from core.security import auth_user
from database.relational_db import User
from domain.orders import (
    SellerOrderItemModel,
    SellerOrderItemShipPayload,
    SellerOrderItemDeliverPayload,
    SellerOrderItemRejectPayload,
)
from service.orders import SellerOrderService, get_seller_order_service

router = APIRouter()


@router.post(
    '/accept',
    response_model=SellerOrderItemModel,
    summary='Accept order item',
)
async def accept_seller_order_item(
    order_item_id: UUID,
    user: Annotated[User, Depends(auth_user)],
    seller_order_svc: Annotated[SellerOrderService, Depends(get_seller_order_service)],
) -> SellerOrderItemModel:
    return await seller_order_svc.accept_item(user=user, item_id=order_item_id)


@router.post(
    '/reject',
    response_model=SellerOrderItemModel,
    summary='Reject order item',
)
async def reject_seller_order_item(
    order_item_id: UUID,
    payload: SellerOrderItemRejectPayload | None,
    user: Annotated[User, Depends(auth_user)],
    seller_order_svc: Annotated[SellerOrderService, Depends(get_seller_order_service)],
) -> SellerOrderItemModel:
    return await seller_order_svc.reject_item(user=user, item_id=order_item_id, payload=payload)


@router.post(
    '/ship',
    response_model=SellerOrderItemModel,
    summary='Mark order item as shipped',
)
async def ship_seller_order_item(
    order_item_id: UUID,
    payload: SellerOrderItemShipPayload,
    user: Annotated[User, Depends(auth_user)],
    seller_order_svc: Annotated[SellerOrderService, Depends(get_seller_order_service)],
) -> SellerOrderItemModel:
    return await seller_order_svc.ship_item(user=user, item_id=order_item_id, payload=payload)


@router.post(
    '/deliver',
    response_model=SellerOrderItemModel,
    summary='Mark order item as delivered',
)
async def deliver_seller_order_item(
    order_item_id: UUID,
    payload: SellerOrderItemDeliverPayload,
    user: Annotated[User, Depends(auth_user)],
    seller_order_svc: Annotated[SellerOrderService, Depends(get_seller_order_service)],
) -> SellerOrderItemModel:
    return await seller_order_svc.deliver_item(user=user, item_id=order_item_id, payload=payload)
