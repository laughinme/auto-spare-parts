from typing import Annotated
from fastapi import APIRouter, Depends

from core.security import auth_user
from domain.carts import (
    CartModel,
    CartSummary,
)
from database.relational_db import User
from service.carts import CartService, get_cart_service

router = APIRouter()


@router.get(
    '/',
    response_model=CartModel,
    description="Get the current user's shopping cart with all items and totals"
)
async def get_cart(
    user: Annotated[User, Depends(auth_user)],
    cart_service: Annotated[CartService, Depends(get_cart_service)],
):
    cart = await cart_service.get_user_cart(user)
    return cart


@router.get(
    '/summary',
    response_model=CartSummary,
    description="Get quick cart summary with total items and amount"
)
async def get_cart_summary(
    user: Annotated[User, Depends(auth_user)],
    cart_service: Annotated[CartService, Depends(get_cart_service)],
):
    summary = await cart_service.get_cart_summary(user)
    return summary


@router.delete(
    '/',
    response_model=CartModel,
    description="Remove all items from the cart"
)
async def clear_cart(
    user: Annotated[User, Depends(auth_user)],
    cart_service: Annotated[CartService, Depends(get_cart_service)],
):
    cart = await cart_service.clear_cart(user)
    return cart
