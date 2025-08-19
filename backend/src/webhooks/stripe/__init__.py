from fastapi import APIRouter


def get_stripe_webhooks() -> APIRouter:
    
    router = APIRouter(prefix='/stripe', tags=['Stripe'])
    
    return router
