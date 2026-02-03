from fastapi import APIRouter


def get_item_id_router() -> APIRouter:
    from .reviews import router as reviews_router
    from .confirmation import router as confirmation_router

    router = APIRouter(prefix='/{item_id}')

    router.include_router(reviews_router)
    router.include_router(confirmation_router)
    
    return router
