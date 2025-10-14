from fastapi import APIRouter


def get_order_id_router() -> APIRouter:
    from .payments import get_payments_router
    from .get_order import router as get_order_router
    from .items import get_items_router

    router = APIRouter(prefix='/{order_id}')

    router.include_router(get_payments_router())
    router.include_router(get_order_router)
    router.include_router(get_items_router())
    
    return router
