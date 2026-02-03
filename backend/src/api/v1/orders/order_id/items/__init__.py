from fastapi import APIRouter


def get_items_router() -> APIRouter:
    from .item_id import get_item_id_router

    router = APIRouter(prefix='/items')

    router.include_router(get_item_id_router())
    
    return router
