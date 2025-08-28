from genericpath import exists
from uuid import UUID
from sqlalchemy import select, delete, update, exists
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.dialects.postgresql import insert

from .cart_table import Cart, CartItem
from ..products import Product


class CartInterface:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def get_cart_only(self, user_id: UUID | str) -> Cart | None:
        return await self.session.scalar(
            select(Cart)
            .where(Cart.user_id == user_id)
        )
        
    async def get_cart(self, user_id: UUID | str) -> Cart:
        result = await self.session.execute(
            insert(Cart)
            .values(user_id=user_id)
            .on_conflict_do_update(
                index_elements=[Cart.user_id],
                set_={Cart.user_id: Cart.user_id}
            )
            .returning(Cart.id)
        )
        cart_id = result.scalar_one()

        result = await self.session.execute(
            select(Cart)
            .where(Cart.id == cart_id)
            .options(
                selectinload(Cart.items)
                    .selectinload(CartItem.product)
                    .selectinload(Product.media),
                selectinload(Cart.items)
                    .selectinload(CartItem.product)
                    .selectinload(Product.make)
            )
        )
        await self.session.flush()
        return result.scalar_one()

    async def clear_cart(self, user_id: UUID | str) -> None:
        await self.session.execute(
            delete(CartItem)
            .options(selectinload(CartItem.cart))
            .where(Cart.user_id == user_id)
        )
        await self.session.flush()


class CartItemInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, item_id: UUID | str) -> CartItem | None:
        return await self.session.scalar(
            select(CartItem).where(CartItem.id == item_id)
        )

    async def get_cart_item(self, cart_id: UUID | str, product_id: UUID | str) -> CartItem | None:
        return await self.session.scalar(
            select(CartItem).where(
                CartItem.cart_id == cart_id,
                CartItem.product_id == product_id
            )
        )

    async def update_quantity(self, item_id: UUID | str, quantity: int) -> CartItem | None:
        result = await self.session.execute(
            update(CartItem)
            .options(
                selectinload(CartItem.cart),
                selectinload(CartItem.product)
            )
            .where(CartItem.id == item_id)
            .values(quantity=quantity)
            .returning(CartItem)
        )
        return result.scalar()

    async def remove_item(self, item_id: UUID | str) -> CartItem | None:
        result = await self.session.execute(
            delete(CartItem)
            .options(selectinload(CartItem.cart))
            .where(CartItem.id == item_id)
            .returning(CartItem)
        )
        return result.scalar()
    
    async def by_product_id(self, product_id: UUID | str) -> list[CartItem]:
        result = await self.session.scalars(
            select(CartItem)
            .where(CartItem.product_id == product_id)
        )
        return list(result.all())

    async def product_id_exists(self, product_id: UUID | str) -> bool:
        result = await self.session.execute(
            select(
                exists()
                .where(CartItem.product_id == product_id)
            )
        )
        return result.scalar_one()
    
    async def delete_items(self, item_ids: list[UUID]) -> None:
        if not item_ids:
            return

        await self.session.execute(
            delete(CartItem)
            .where(CartItem.id.in_(item_ids))
        )
