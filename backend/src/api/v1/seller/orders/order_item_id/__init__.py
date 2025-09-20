from fastapi import APIRouter


def get_order_item_router() -> APIRouter:
    from .get_item import router as get_item_router
    from .manage import router as manage_router

    router = APIRouter(prefix='/{order_item_id}')

    router.include_router(get_item_router)
    router.include_router(manage_router)

    return router
