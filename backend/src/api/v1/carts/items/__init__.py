from fastapi import APIRouter


def get_carts_items_router() -> APIRouter:
    from .items import router as items_router

    router = APIRouter(prefix='/items')

    router.include_router(items_router)

    return router
