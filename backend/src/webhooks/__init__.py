from fastapi import APIRouter


def get_webhooks() -> APIRouter:
    from .stripe import get_stripe_webhooks
    
    webhooks = APIRouter(prefix='/webhooks', tags=['Webhooks'], include_in_schema=True)
    
    webhooks.include_router(get_stripe_webhooks())
    
    return webhooks
