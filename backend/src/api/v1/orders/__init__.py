from fastapi import APIRouter


def get_orders_router() -> APIRouter:
    from .prepare import router as prepare_router
    from .list import router as list_router
    from .order_id import get_order_id_router

    router = APIRouter(prefix='/orders', tags=['Orders'])

    router.include_router(prepare_router)
    router.include_router(list_router)
    router.include_router(get_order_id_router())
    
    return router
