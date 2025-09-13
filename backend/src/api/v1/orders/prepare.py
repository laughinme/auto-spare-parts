from typing import Annotated
from fastapi import APIRouter, Depends

from core.security import auth_user
from domain.orders import PrepareCheckout, PrepareCheckoutResponse, PrepareCheckoutStripeHostedResponse
from database.relational_db import User
from service.orders import OrderService, get_order_service
from service.payments import StripeService, get_stripe_service

router = APIRouter()


@router.post(
    '/prepare',
    response_model=PrepareCheckoutResponse,
    status_code=201,
    description="Prepare the current user's shopping cart for checkout"
)
async def prepare_checkout(
    payload: PrepareCheckout,
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
):
    order = await order_svc.create_order(user, payload)
    client_secret = await stripe_svc.create_checkout_session(user, order)
    
    return {'order_id': order.id, 'client_secret': client_secret}


@router.post(
    '/prepare/stripe-hosted',
    response_model=PrepareCheckoutStripeHostedResponse,
    status_code=201,
    description="Prepare the current user's shopping cart for checkout with Stripe Hosted Checkout"
)
async def prepare_checkout_stripe_hosted(
    payload: PrepareCheckout,
    user: Annotated[User, Depends(auth_user)],
    order_svc: Annotated[OrderService, Depends(get_order_service)],
    stripe_svc: Annotated[StripeService, Depends(get_stripe_service)],
):
    order = await order_svc.create_order(user, payload)
    url = await stripe_svc.create_checkout_session_stripe_hosted(user, order)
    
    return {'order_id': order.id, 'url': url}
