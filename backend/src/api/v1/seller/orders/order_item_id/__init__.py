from fastapi import APIRouter


def get_order_item_router() -> APIRouter:
    from .manage import router as manage_router

    router = APIRouter(prefix='/orders/{order_item_id}')

    router.include_router(manage_router)

    return router
