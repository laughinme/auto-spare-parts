from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path

from core.security import auth_user
from domain.orders import PrepareCheckoutResponse, PrepareCheckoutStripeHostedResponse
from database.relational_db import User
from service.orders import OrderService, get_order_service
from service.payments import StripeService, get_stripe_service

router = APIRouter()


@router.post(
    '/',
    response_model=PrepareCheckoutResponse,
    description="Prepare the current user's shopping cart for checkout",
    include_in_schema=False,
)
async def pay_order(
    order_id: Annotated[UUID, Path(..., description="The ID of the order to pay for")],
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
):
    order = await order_svc.get_order_by_id(order_id, user)
    client_secret = await stripe_svc.create_checkout_session(user, order)
    
    return {'order_id': order.id, 'client_secret': client_secret}


@router.post(
    '/stripe-hosted',
    response_model=PrepareCheckoutStripeHostedResponse,
    description="Prepare the current user's shopping cart for checkout",
    include_in_schema=False,
)
async def pay_order_stripe_hosted(
    order_id: Annotated[UUID, Path(..., description="The ID of the order to pay for")],
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
):
    order = await order_svc.get_order_by_id(order_id, user)
    url = await stripe_svc.create_checkout_session_stripe_hosted(user, order)
    
    return {'order_id': order.id, 'url': url}
