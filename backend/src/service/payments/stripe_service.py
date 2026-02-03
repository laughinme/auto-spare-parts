import stripe
import asyncio
from uuid import UUID
from decimal import Decimal
from fastapi import HTTPException

from database.relational_db import (
    UoW,
    CartInterface,
    User,
    Order,
    # CheckoutSession,
    # CheckoutSessionInterface,
)
from service.orders import OrderService
from domain.orders import PrepareCheckout
from domain.payments import PaymentStatus
from core.config import Settings

settings = Settings() # type: ignore

class StripeService:
    """Service layer encapsulating all interactions with the Stripe API."""
    def __init__(self, uow: UoW):
        self.uow = uow
        self.cart_repo = CartInterface(uow.session)
        # self.checkout_repo = CheckoutSessionInterface(uow.session)

    async def create_account(self) -> str:
        account = stripe.Account.create(
            controller={
                "stripe_dashboard": {
                    "type": "express",
                },
                "fees": {
                    "payer": "application"
                },
                "losses": {
                    "payments": "application"
                },
                # "requirement_collection": "application",
            },
            # capabilities={
            #     "transfers": {"requested": True}
            # },
            # country="US",
        )

        return account.id

    async def create_account_session(self, account_id: str) -> str:
        account_session = stripe.AccountSession.create(
            account=account_id,
            components={
                "account_onboarding": {
                    "enabled": True,
                },
            },
        )

        return account_session.client_secret
    

    @staticmethod
    async def _create_checkout_session(**kwargs) -> stripe.checkout.Session:
        try:
            session = await asyncio.to_thread(stripe.checkout.Session.create, **kwargs)
        except Exception as e:
            raise HTTPException(500, detail=f'Stripe API error: {str(e)}')
        
        return session

    
    async def create_checkout_session(self, user: User, order: Order) -> str:
        line_items = [{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': item.product_title,
                    'description': item.product_description,
                    # 'images': [media.url for media in item.product.media[:min(len(item.product.media), 8)]], #TODO: add images
                },
                'unit_amount': int(item.unit_price * 100),
            },
            'quantity': item.quantity,
        } for item in order.items]
        
        session = await self._create_checkout_session(
            line_items=line_items,  # pyright: ignore[reportArgumentType]
            ui_mode='embedded',
            mode='payment',
            return_url=settings.WEB_URL + '/buyer/orders?session_id={CHECKOUT_SESSION_ID}',
            # automatic_tax={'enabled': True},
            metadata={
                'order_id': str(order.id),
                'buyer_id': str(user.id),
            },
        )
        
        if session.client_secret is None:
            raise HTTPException(500, detail='Failed to create checkout session')
        
        order.stripe_checkout_session_id = session.id
        
        # if session.payment_intent is None or not session.payment_intent.id:
        #     raise HTTPException(500, detail='Failed to create checkout session')
        
        # order.stripe_payment_intent_id = str(session.payment_intent.id)
        
        # checkout_session = CheckoutSession(
        #     buyer_id=user.id,
        #     currency="usd",
        #     total_amount=sum(item.product.price * item.quantity for item in items),
        #     payment_status=PaymentStatus.PENDING,
        #     # expires_at=datetime.now() + timedelta(minutes=10),
        # )
        # await self.checkout_repo.add(checkout_session)
        
        return session.client_secret

    async def create_checkout_session_stripe_hosted(self, user: User, order: Order) -> str:
        line_items = [{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': item.product_title,
                    'description': item.product_description,
                    # 'images': [media.url for media in item.product.media[:min(len(item.product.media), 8)]], #TODO: add images
                },
                'unit_amount': int(item.unit_price * 100),
            },
            'quantity': item.quantity,
        } for item in order.items]
        
        session = await self._create_checkout_session(
            line_items=line_items,  # pyright: ignore[reportArgumentType]
            ui_mode='hosted',
            mode='payment',
            success_url=settings.WEB_URL + '/buyer/orders?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=settings.WEB_URL + '/buyer/orders?session_id={CHECKOUT_SESSION_ID}',
            # automatic_tax={'enabled': True},
            metadata={
                'order_id': str(order.id),
                'buyer_id': str(user.id),
            },
        )
        
        if session.url is None:
            raise HTTPException(500, detail='Failed to create checkout session')
        
        order.stripe_checkout_session_id = session.id
        
        return session.url
