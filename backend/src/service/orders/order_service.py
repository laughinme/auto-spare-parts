from decimal import Decimal
from uuid import UUID
from typing import Optional
from fastapi import HTTPException, status

from domain.orders import OrderStatusUpdate, OrderStatus, PrepareCheckout
from domain.payments import PaymentStatus
from domain.products import ProductStatus, StockType
from database.relational_db import (
    UoW,
    User,
    Cart,
    Order,
    OrderItem,
    CartInterface,
    CartItemInterface,
    OrderInterface,
    OrderItemInterface,
    CartItem,
    # CheckoutSession,
    # CheckoutSessionInterface,   
)


class OrderService:
    """Service for order management operations"""
    
    def __init__(
        self,
        uow: UoW,
        cart_repo: CartInterface,
        cart_item_repo: CartItemInterface,
        order_repo: OrderInterface,
        order_item_repo: OrderItemInterface,
    ):
        self.uow = uow
        self.cart_repo = cart_repo
        self.cart_item_repo = cart_item_repo
        self.order_repo = order_repo
        self.order_item_repo = order_item_repo
        # self.checkout_repo = CheckoutSessionInterface(uow.session)
        
    @staticmethod
    def _validate_items(cart: Cart, chosen_ids: list[UUID]) -> list[CartItem]:
        if not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        if chosen_ids:
            chosen_items = [item for item in cart.items if item.id in chosen_ids]
            if len(chosen_items) != len(chosen_ids):
                raise ValueError("Invalid cart item ID: some items are not found in the cart.")
        else:
            chosen_items = cart.items

        for item in chosen_items:
            product = item.product
            
            if product.status != ProductStatus.PUBLISHED:
                raise ValueError(f"Product must be published. Product ID: {product.id}. Item ID: {item.id}")
            if not product.allow_cart:
                raise ValueError(f"Product must allow cart. Product ID: {product.id}. Item ID: {item.id}")
            # if product.stock_type == StockType.UNIQUE:
            #         raise ValueError("Cart cannot be allowed for UNIQUE stock type")
            if product.quantity_on_hand < item.quantity:
                raise ValueError(f"Quantity must be less than or equal to the quantity on hand. Product ID: {product.id}. Item ID: {item.id}")
            
        return chosen_items
            
            
    async def create_order(self, user: User, payload: PrepareCheckout) -> Order:
        """Create order from user's cart items"""
        # Get user's cart
        cart = await self.cart_repo.get_cart(user.id)
        
        # if cart.updated_at < payload.cart_updated_at:
        #     raise HTTPException(409, detail='Cart has been updated since last checkout. Reload the page and try again.')
        
        try:
            items = self._validate_items(cart, payload.cart_item_ids)
        except ValueError as e:
            raise HTTPException(409, detail=str(e))

        # orders_by_org = {}
        
        # for cart_item in items:
        #     org_id = cart_item.product.org_id
        #     if org_id not in orders_by_org:
        #         orders_by_org[org_id] = []
        #     orders_by_org[org_id].append(cart_item)

        # # In a real implementation, you'd create multiple orders
        # first_org_id = list(orders_by_org.keys())[0]
        # first_org_items = orders_by_org[first_org_id]

        # Create order
        order = Order(
            buyer_id=user.id,
            payment_status=PaymentStatus.PENDING,
            total_amount=sum(item.total_price for item in items),
            total_items=sum(item.quantity for item in items),
            unique_items=len(items),
            notes=payload.notes,
            shipping_address=str(payload.shipping_address) if payload.shipping_address else None, # TODO: add shipping address model
        )
        self.order_repo.add(order)
        await self.uow.flush()
        await self.uow.session.refresh(order, ['items'])

        # Create order items from cart items
        for cart_item in items:
            product = cart_item.product
            order_item = OrderItem(
                product_id=cart_item.product_id,
                seller_org_id=cart_item.seller_org_id,
                cart_item_id=cart_item.id,
                quantity=cart_item.quantity,
                unit_price=product.price,
                total_price=Decimal(cart_item.quantity * product.price),
                # Snapshot product data
                product_make_id=product.make_id,
                product_make_name=product.make.make_name,
                product_part_number=product.part_number,
                product_condition=product.condition,
                product_title=product.title,
                product_description=product.description,
                status=OrderStatus.PENDING,
            )
            order.items.append(order_item)

        # Clear cart after creating order
        # await self.cart_item_repo.delete_items([item.id for item in cart.items])
        
        # await self.uow.commit()
        
        # Refresh order with items
        # await self.uow.session.refresh(order)
        
        return order

    async def get_user_orders(
        self,
        user: User,
        *,
        offset: int = 0,
        limit: int = 20,
        status: Optional[OrderStatus] = None,
    ) -> tuple[list[Order], int]:
        """Get user's orders with pagination"""
        return await self.order_repo.get_user_orders(
            user.id,
            offset=offset,
            limit=limit,
            status=status,
        )

    async def get_order_by_id(self, order_id: UUID, user: User) -> Order:
        """Get order by ID, ensuring user owns it"""
        order = await self.order_repo.get_by_id(order_id)
        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if order.buyer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
        
        return order

    # async def update_order_status(
    #     self,
    #     order_id: UUID,
    #     payload: OrderStatusUpdate,
    #     user: User,  # For future: check if user is seller
    # ) -> Order:
    #     """Update order status (seller only - basic implementation)"""
    #     order = await self.order_repo.get_by_id(order_id)
    #     if order is None:
    #         raise HTTPException(
    #             status_code=status.HTTP_404_NOT_FOUND,
    #             detail="Order not found"
    #         )

    #     # Update status
    #     order.status = payload.status
    #     if payload.tracking_number:
    #         order.tracking_number = payload.tracking_number

    #     await self.uow.commit()
    #     await self.uow.session.refresh(order)
    #     return order
