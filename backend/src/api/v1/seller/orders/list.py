from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from core.security import auth_user
from database.relational_db import User
from domain.common import CursorPage
from domain.orders import OrderStatus, SellerOrderItemModel
from service.orders import SellerOrderService, get_seller_order_service

router = APIRouter()


@router.get(
    '/',
    response_model=CursorPage[SellerOrderItemModel],
    summary='List order items that belong to the seller',
    description='Returns order items scoped to the organizations the current user is part of.',
)
async def list_seller_order_items(
    *,
    user: Annotated[User, Depends(auth_user)],
    seller_order_svc: Annotated[SellerOrderService, Depends(get_seller_order_service)],
    statuses: Annotated[list[OrderStatus], Query(default_factory=list, description='Filter by item statuses')],
    search: str | None = Query(default=None, description='Search by part number or title'),
    org_id: UUID | None = Query(default=None, description='Filter by specific organization ID'),
    cursor: str | None = Query(default=None, description='Cursor for pagination'),
    limit: int = Query(default=20, ge=1, le=100, description='Number of items to return'),
) -> CursorPage[SellerOrderItemModel]:
    items, next_cursor = await seller_order_svc.list_items(
        user=user,
        cursor=cursor,
        limit=limit,
        statuses=statuses,
        search=search,
        org_id=org_id,
    )
    return CursorPage(items=items, next_cursor=next_cursor)
