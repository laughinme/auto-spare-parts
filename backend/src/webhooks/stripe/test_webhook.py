import stripe

from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Request, HTTPException, Depends
from logging import getLogger

from utils import parse_event
from core.config import Settings
from database.relational_db import Order
from service.payments import StripeService, get_stripe_service
from service.orders import OrderService, get_order_service
from service.carts import CartService, get_cart_service

router = APIRouter()
settings = Settings() # type: ignore
logger = getLogger(__name__)


@router.post(
    path="/test",
    summary="Test webhook",
)
async def handle_test_any(
    request: Request,
    order_svc: Annotated[OrderService, Depends(get_order_service)],
    cart_svc: Annotated[CartService, Depends(get_cart_service)],
):
    try:
        event = await parse_event(request)
        logger.info(f"Received Stripe event {event.id} type={event.type}")
        
        # NOTE: I'll assume that all the checkout sessions end with successful payment.
        # We absolutely have to add payment intent events processing here.
        if event.type == "checkout.session.completed":
            logger.info(f"Checkout session completed: {event.data.object['id']}")
            
            session_data = event.data.object
            session = stripe.checkout.Session.construct_from(session_data, None)
        
            metadata = session.metadata
            if not metadata:
                logger.error("No metadata found in session")
                return
            
            order_id = metadata.get("order_id")
            buyer_id = metadata.get("buyer_id")
            if not order_id or not buyer_id: return
            order_id = UUID(order_id)
            
            # order = await order_svc.get_order(order_id)
            # if not order:
            #     logger.error(f"Order not found: {order_id}")
            #     return
            
            # Lock cart items for the buyer
            await cart_svc.lock_cart_items(order_id, buyer_id)
            
            
            # For now we'll assume that the order is already paid for.
            await cart_svc.purchase_cart_items(order_id, buyer_id)
            await order_svc.pay_order(order_id)
        
        else:
            logger.warning(f"Unhandled event type: {event.type}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {e!s}")
        raise HTTPException(status_code=500, detail=f"Webhook error: {e!s}")
