from fastapi import APIRouter


def get_stripe_webhooks() -> APIRouter:
    from .test_webhook import router as test_webhook_router
    from .connect import get_connect_webhooks
    
    router = APIRouter(prefix='/stripe')
    
    router.include_router(test_webhook_router)
    router.include_router(get_connect_webhooks())
    
    return router
