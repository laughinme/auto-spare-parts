from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends

from core.security import auth_user
from domain.carts import (
    CartModel, 
    CartItemCreate, 
    CartItemUpdate, 
    CartItemRemove,
)
from database.relational_db import User
from service.carts import CartService, get_cart_service

router = APIRouter()


@router.post(
    '/',
    response_model=CartModel,
    status_code=201,
    description="Add a product to the cart. If product already exists, quantity will be added to existing amount."
)
async def add_item_to_cart(
    payload: CartItemCreate,
    user: Annotated[User, Depends(auth_user)],
    cart_service: Annotated[CartService, Depends(get_cart_service)],
):
    return await cart_service.add_item_to_cart(user, payload)

@router.put(
    '/{item_id}',
    response_model=CartModel,
    summary="Update cart item quantity",
    description="Update the quantity of a specific cart item"
)
async def update_cart_item(
    item_id: UUID,
    payload: CartItemUpdate,
    user: Annotated[User, Depends(auth_user)],
    cart_service: Annotated[CartService, Depends(get_cart_service)],
):
    return await cart_service.update_cart_item_quantity(user, item_id, payload)

@router.delete(
    '/{item_id}',
    response_model=CartModel,
    summary="Remove item from cart",
    description="Remove a specific product from the cart"
)
async def remove_item_from_cart(
    item_id: UUID,
    user: Annotated[User, Depends(auth_user)],
    cart_service: Annotated[CartService, Depends(get_cart_service)],
):
    return await cart_service.remove_item_from_cart(user, item_id)
