from __future__ import annotations

from datetime import datetime, UTC
from uuid import UUID

from fastapi import HTTPException, status

from database.relational_db import (
    UoW,
    OrderItemInterface,
    OrganizationsInterface,
    OrderItem,
    User,
)
from domain.orders import (
    OrderStatus,
    OrderItemModel,
    SellerBuyerPreview,
    SellerOrderItemModel,
    SellerOrderItemShipPayload,
    SellerOrderItemDeliverPayload,
    SellerOrderItemRejectPayload,
)
from utils.cursor import create_cursor, parse_cursor


class SellerOrderService:
    """Service layer for seller-facing order item operations."""

    def __init__(
        self,
        uow: UoW,
        order_item_repo: OrderItemInterface,
        org_repo: OrganizationsInterface,
    ) -> None:
        self.uow = uow
        self.order_item_repo = order_item_repo
        self.org_repo = org_repo

    async def list_items(
        self,
        *,
        user: User,
        cursor: str | None,
        limit: int,
        statuses: list[OrderStatus],
        search: str | None,
        org_id: UUID | None,
    ) -> tuple[list[SellerOrderItemModel], str | None]:
        org_ids = await self._get_user_org_ids(user)
        if org_id is not None and org_id not in org_ids:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Organization not accessible")

        cursor_data = parse_cursor(cursor)
        raw_items = await self.order_item_repo.list_for_seller(
            org_ids,
            statuses=statuses,
            search=search,
            org_id=org_id,
            limit=limit,
            **cursor_data,
        )

        items = [self._to_seller_model(item) for item in raw_items]
        next_cursor = create_cursor(raw_items, limit)
        return items, next_cursor

    async def get_item(self, *, user: User, item_id: UUID) -> SellerOrderItemModel:
        item = await self._get_item_scoped(user, item_id)
        return self._to_seller_model(item)

    async def accept_item(self, *, user: User, item_id: UUID) -> SellerOrderItemModel:
        item = await self._get_item_scoped(user, item_id)
        if item.status not in {OrderStatus.PENDING}:
            raise HTTPException(status.HTTP_409_CONFLICT, "Item cannot be accepted in the current status")

        item.status = OrderStatus.CONFIRMED
        await self.uow.commit()
        await self._refresh_item(item)
        return self._to_seller_model(item)

    async def reject_item(
        self,
        *,
        user: User,
        item_id: UUID,
        payload: SellerOrderItemRejectPayload | None,
    ) -> SellerOrderItemModel:
        item = await self._get_item_scoped(user, item_id)
        if item.status not in {OrderStatus.PENDING, OrderStatus.CONFIRMED}:
            raise HTTPException(status.HTTP_409_CONFLICT, "Item cannot be rejected in the current status")

        _ = payload  # Reserved for future seller-facing messaging workflows
        item.status = OrderStatus.CANCELLED
        await self.uow.commit()
        await self._refresh_item(item)
        return self._to_seller_model(item)

    async def ship_item(self, *, user: User, item_id: UUID, payload: SellerOrderItemShipPayload) -> SellerOrderItemModel:
        item = await self._get_item_scoped(user, item_id)
        if item.status not in {OrderStatus.CONFIRMED, OrderStatus.PROCESSING}:
            raise HTTPException(status.HTTP_409_CONFLICT, "Item must be confirmed before shipping")

        item.status = OrderStatus.SHIPPED
        item.carrier_code = payload.carrier_code
        item.tracking_number = payload.tracking_number
        item.tracking_url = str(payload.tracking_url) if payload.tracking_url else None
        item.shipped_at = payload.shipped_at or datetime.now(UTC)
        await self.uow.commit()
        await self._refresh_item(item)
        return self._to_seller_model(item)

    async def deliver_item(self, *, user: User, item_id: UUID, payload: SellerOrderItemDeliverPayload) -> SellerOrderItemModel:
        item = await self._get_item_scoped(user, item_id)
        if item.status != OrderStatus.SHIPPED:
            raise HTTPException(status.HTTP_409_CONFLICT, "Item must be shipped before confirming delivery")

        item.status = OrderStatus.DELIVERED
        item.delivered_at = payload.delivered_at or datetime.now(UTC)
        await self.uow.commit()
        await self._refresh_item(item)
        return self._to_seller_model(item)

    async def _get_item_scoped(self, user: User, item_id: UUID) -> OrderItem:
        org_ids = await self._get_user_org_ids(user)
        item = await self.order_item_repo.get_for_seller(item_id, org_ids)
        if item is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Order item not found")
        return item

    async def _refresh_item(self, item: OrderItem) -> None:
        await self.uow.session.refresh(item)
        await self.uow.session.refresh(
            item,
            attribute_names=["order", "seller_organization", "product"],
        )
        if item.order is not None:
            await self.uow.session.refresh(item.order, attribute_names=["buyer"])

    async def _get_user_org_ids(self, user: User) -> list[UUID]:
        organizations = await self.org_repo.list_for_user(user.id)
        if not organizations:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No seller organizations found for this user")
        return [org.id for org in organizations]

    @staticmethod
    def _make_order_reference(order_id: UUID) -> str:
        return order_id.hex[:8].upper()

    def _to_seller_model(self, item: OrderItem) -> SellerOrderItemModel:
        order = item.order
        if order is None:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Order relation not loaded")

        base_item = OrderItemModel.model_validate(item, from_attributes=True)

        buyer = order.buyer
        if buyer is None:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Buyer relation not loaded")

        buyer_preview = SellerBuyerPreview(
            id=buyer.id,
            email=getattr(buyer, "email", None),
            username=getattr(buyer, "username", None),
        )

        return SellerOrderItemModel(
            **base_item.model_dump(mode="python"),
            order_reference=self._make_order_reference(order.id),
            order_created_at=order.created_at,
            payment_status=order.payment_status,
            shipping_address=order.shipping_address,
            buyer=buyer_preview,
            notes=order.notes,
        )
