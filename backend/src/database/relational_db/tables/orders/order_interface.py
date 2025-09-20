from uuid import UUID
from datetime import datetime
from sqlalchemy import select, func, or_, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from domain.orders import OrderStatus
from domain.payments import PaymentStatus, OrderBy
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
        return await self.session.scalar(
            select(Order)
            .where(Order.id == id)
        )

    async def get_user_orders(
        self,
        user_id: UUID | str,
        *,
        search: str | None = None,
        statuses: list[PaymentStatus],
        order_by: OrderBy,
        limit: int = 20,
        cursor_created_at: datetime | None = None,
        cursor_id: UUID | None = None,
    ) -> list[Order]:
        stmt = (
            select(Order)
            .join(Order.items)
            .where(Order.buyer_id == user_id)
        )
        
        if statuses:
            stmt = stmt.where(Order.payment_status.in_(statuses))
            
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Order.notes.ilike(pattern),
                    OrderItem.product_make_name.ilike(pattern),
                    OrderItem.product_part_number.ilike(pattern),
                    OrderItem.product_description.ilike(pattern),
                    OrderItem.product_title.ilike(pattern),
                )
            )
            
        if cursor_created_at is not None and cursor_id is not None:
            stmt = stmt.where(
                or_(
                    Order.created_at < cursor_created_at,
                    and_(Order.created_at == cursor_created_at, Order.id < cursor_id),
                )
            )
        
        # order_params = []
        if order_by == OrderBy.CREATED_AT_ASC:
            stmt = stmt.order_by(Order.created_at.asc())
        elif order_by == OrderBy.CREATED_AT_DESC:
            stmt = stmt.order_by(Order.created_at.desc())
        elif order_by == OrderBy.PRICE_ASC:
            stmt = stmt.order_by(Order.total_amount.asc())
        elif order_by == OrderBy.PRICE_DESC:
            stmt = stmt.order_by(Order.total_amount.desc())
    
        stmt = stmt.order_by(Order.id.desc()).limit(limit)
        rows = await self.session.scalars(stmt)
        
        return list(rows.all())

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

    async def update_payment_status(self, order_id: UUID | str, status: PaymentStatus) -> Order | None:
        result = await self.session.execute(
            update(Order)
            .where(Order.id == order_id)
            .values(payment_status=status)
            .returning(Order)
        )
        
        return result.scalar()

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

    async def update_status(self, order_id: UUID | str, status: OrderStatus) -> OrderItem | None:
        result = await self.session.execute(
            update(OrderItem)
            .where(OrderItem.order_id == order_id)
            .values(status=status)
            .returning(OrderItem)
        )
        return result.scalar()

    async def list_for_seller(
        self,
        org_ids: list[UUID | str],
        *,
        statuses: list[OrderStatus],
        search: str | None,
        org_id: UUID | str | None,
        limit: int,
        cursor_created_at: datetime | None,
        cursor_id: UUID | None,
    ) -> list[OrderItem]:
        if not org_ids:
            return []

        stmt = (
            select(OrderItem)
            .join(Order)
            .where(OrderItem.seller_org_id.in_(org_ids))
        )

        if org_id is not None:
            stmt = stmt.where(OrderItem.seller_org_id == org_id)

        if statuses:
            stmt = stmt.where(OrderItem.status.in_(statuses))

        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    OrderItem.product_title.ilike(pattern),
                    OrderItem.product_part_number.ilike(pattern),
                    OrderItem.product_description.ilike(pattern),
                )
            )

        if cursor_created_at is not None and cursor_id is not None:
            stmt = stmt.where(
                or_(
                    OrderItem.created_at < cursor_created_at,
                    and_(OrderItem.created_at == cursor_created_at, OrderItem.id < cursor_id),
                )
            )

        stmt = stmt.order_by(OrderItem.created_at.desc(), OrderItem.id.desc()).limit(limit)
        rows = await self.session.scalars(stmt)
        return list(rows.all())

    async def get_for_seller(
        self,
        item_id: UUID | str,
        org_ids: list[UUID | str],
    ) -> OrderItem | None:
        if not org_ids:
            return None

        stmt = (
            select(OrderItem)
            .join(Order)
            .where(
                OrderItem.id == item_id,
                OrderItem.seller_org_id.in_(org_ids),
            )
        )

        return await self.session.scalar(stmt)
