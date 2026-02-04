from fastapi import APIRouter


def get_order_id_router() -> APIRouter:
    from .items import get_items_router

    router = APIRouter(prefix='/orders/{order_id}')

    router.include_router(get_items_router(), tags=['New'])
    
    return router
