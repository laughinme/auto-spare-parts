from fastapi import APIRouter


def get_products_router() -> APIRouter:
    from .public import router as public_router

    router = APIRouter(prefix='/products', tags=['Products'])

    router.include_router(public_router)

    return router


