from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from domain.orders import OrderStatus
from .order_table import Order, OrderItem


class OrderInterface:
    """Interface for working with orders in database"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    def add(self, order: Order) -> Order:
        """Add new order to session"""
        self.session.add(order)
        return order

    async def get_by_id(self, id: UUID | str) -> Order | None:
        """Get order by ID"""
        return await self.session.scalar(select(Order).where(Order.id == id))

    async def get_user_orders(
        self,
        user_id: UUID | str,
        *,
        offset: int = 0,
        limit: int = 20,
        status: OrderStatus | None = None,
    ) -> tuple[list[Order], int]:
        stmt = select(Order).where(Order.buyer_id == user_id)
        
        # if status is not None:
        #     stmt = stmt.where(Order.status == status)
        
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt)
        
        stmt = stmt.order_by(Order.created_at.desc()).offset(offset).limit(limit)
        rows = await self.session.scalars(stmt)
        
        return list(rows.all()), int(total or 0)

    async def get_organization_orders(
        self,
        org_id: UUID | str,
        *,
        offset: int = 0,
        limit: int = 20,
        status: OrderStatus | None = None,
    ) -> tuple[list[Order], int]:
        """Get organization's orders (as seller) with pagination"""
        stmt = (
            select(Order)
            # .where(Order.seller_org_id == org_id)
        )
        
        # Filter by status
        # if status is not None:
        #     stmt = stmt.where(Order.status == status)
        
        # Count total items
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt)
        
        # Pagination and sorting (newest first)
        stmt = stmt.order_by(Order.created_at.desc()).offset(offset).limit(limit)
        rows = await self.session.scalars(stmt)
        
        return list(rows.all()), int(total or 0)

    async def update_status(self, order_id: UUID | str, status: OrderStatus) -> Order | None:
        """Update order status"""
        order = await self.get_by_id(order_id)
        if order is None:
            return None
        
        # order.status = status
        await self.session.flush()
        return order


class OrderItemInterface:
    """Interface for working with order items in database"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add(self, order_item: OrderItem) -> OrderItem:
        """Add new order item to session"""
        self.session.add(order_item)
        return order_item

    async def get_by_id(self, id: UUID | str) -> OrderItem | None:
        """Get order item by ID"""
        return await self.session.scalar(
            select(OrderItem).where(OrderItem.id == id)
        )
