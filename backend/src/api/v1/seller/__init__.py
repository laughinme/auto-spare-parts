from fastapi import APIRouter


def get_seller_router() -> APIRouter:
    from .orders import get_orders_router

    router = APIRouter(
        prefix='/seller',
        tags=['Seller'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(get_orders_router())
    
    return router
