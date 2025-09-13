from uuid import UUID
from fastapi import HTTPException

from domain.carts import CartItemCreate, CartItemUpdate, CartItemStatus
from domain.products import ProductStatus, StockType
from database.relational_db import (
    UoW,
    User,
    Cart,
    CartItem,
    CartInterface,
    CartItemInterface,
    ProductsInterface,
)


class CartService:
    def __init__(
        self,
        uow: UoW,
        cart_repo: CartInterface,
        cart_item_repo: CartItemInterface,
        product_repo: ProductsInterface,
    ):
        self.uow = uow
        self.cart_repo = cart_repo
        self.cart_item_repo = cart_item_repo
        self.product_repo = product_repo
        
    async def get_cart_summary(self, user: User) -> Cart | dict:
        cart = await self.cart_repo.get_cart_only(user.id)
        if cart is None:
            return {'total_items': 0, 'total_amount': 0}
        return cart

    async def get_user_cart(self, user: User, include_locked: bool = False) -> Cart:
        return await self.cart_repo.get_cart(user.id, include_locked)
        
    async def add_item_to_cart(self, user: User, payload: CartItemCreate) -> Cart:
        cart = await self.cart_repo.get_cart(user.id)
        
        product = await self.product_repo.get_by_id(payload.product_id)
        if product is None:
            raise HTTPException(404, detail="Product not found")
        
        if product.status != ProductStatus.PUBLISHED:
            raise HTTPException(400, detail="Product is not available for purchase")
        if not product.allow_cart or product.stock_type == StockType.UNIQUE:
            raise HTTPException(409, detail="Cart is disabled for this product")
        # Check if the product is a stock item and if there is insufficient quantity available.
        # if product.stock_type == StockType.STOCK and product.quantity_on_hand < payload.quantity: # I don't know if we really need stock type check 
        if product.quantity_on_hand < payload.quantity:
            raise HTTPException(409, detail="Not enough stock available")

        existing_item = await self.cart_item_repo.get_cart_item(cart.id, payload.product_id)
        
        if existing_item:
            new_quantity = existing_item.quantity + payload.quantity
            if new_quantity > 99:
                raise HTTPException(400, detail="Maximum quantity per item is 99")
            if product.quantity_on_hand < new_quantity:
                raise HTTPException(409, detail="Not enough stock available")
            
            existing_item.quantity = new_quantity
        else:
            cart_item = CartItem(
                product_id=payload.product_id,
                seller_org_id=product.org_id,
                quantity=payload.quantity,
                unit_price=float(product.price),
                title=product.title,
                description=product.description,
                part_number=product.part_number,
            )
            cart.items.append(cart_item)
            await self.uow.session.flush()
        
        return await self.get_user_cart(user)
        

    async def update_cart_item_quantity(self, user: User, item_id: UUID, payload: CartItemUpdate) -> Cart:
        cart_item = await self.cart_item_repo.update_quantity(item_id, payload.quantity)
        if cart_item is None:
            raise HTTPException(404, detail="Cart item not found")
        if cart_item.cart.user_id != user.id:
            raise HTTPException(403, detail="You are not allowed to update this item")
        if cart_item.product.stock_type == StockType.STOCK and cart_item.product.quantity_on_hand < payload.quantity:
            raise HTTPException(409, detail="Not enough stock available")

        return await self.get_user_cart(user)

    async def remove_item_from_cart(self, user: User, item_id: UUID) -> Cart:
        removed = await self.cart_item_repo.remove_item(item_id)
        if removed is None:
            raise HTTPException(404, detail="Item not found in cart")
        if removed.cart.user_id != user.id:
            raise HTTPException(403, detail="You are not allowed to remove this item")
        
        return await self.get_user_cart(user)

    async def clear_cart(self, user: User) -> Cart:
        await self.cart_repo.clear_cart(user.id)
        
        return await self.get_user_cart(user)
    
    async def lock_cart_items(self, order_id: UUID, user_id: UUID | str):
        await self.cart_item_repo.lock_items(order_id, user_id)
        
    async def purchase_cart_items(self, order_id: UUID, user_id: UUID | str):
        await self.cart_item_repo.purchase_items(order_id, user_id)
