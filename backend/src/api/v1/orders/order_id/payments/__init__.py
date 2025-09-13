from fastapi import APIRouter


def get_payments_router() -> APIRouter:
    from .pay import router as payments_router

    router = APIRouter(prefix='/payments')

    router.include_router(payments_router)

    return router
