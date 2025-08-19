from fastapi import APIRouter


def get_webhooks() -> APIRouter:
    from .stripe import get_stripe_webhooks
    
    webhooks = APIRouter(prefix='/webhooks', tags=['Webhooks'])
    
    webhooks.include_router(get_stripe_webhooks())
    
    return webhooks
