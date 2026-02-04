from fastapi import APIRouter


def get_orders_router() -> APIRouter:
    from .list import router as list_router
    from .order_item_id import get_order_item_router
    from .order_item_id.get_item import router as get_item_router

    router = APIRouter(
        tags=['Seller'],
    )

    router.include_router(list_router)
    router.include_router(get_item_router)
    router.include_router(get_order_item_router())

    return router
