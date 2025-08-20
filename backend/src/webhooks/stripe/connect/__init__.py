from fastapi import APIRouter


def get_connect_webhooks() -> APIRouter:
    from .onboarding import router as onboarding_router
    
    router = APIRouter(prefix='/connect')
    
    router.include_router(onboarding_router)
    
    return router
