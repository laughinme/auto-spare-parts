from fastapi import APIRouter


def get_order_id_router() -> APIRouter:
    from .payments import get_payments_router

    router = APIRouter(prefix='/{order_id}')

    router.include_router(get_payments_router())

    return router
