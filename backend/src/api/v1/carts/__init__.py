from fastapi import APIRouter


def get_carts_router() -> APIRouter:
    from .cart import router as cart_router
    from .items import get_carts_items_router

    router = APIRouter(prefix='/cart', tags=['Carts'])

    router.include_router(cart_router)
    router.include_router(get_carts_items_router())

    return router
