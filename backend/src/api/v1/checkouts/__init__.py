from fastapi import APIRouter


def get_checkouts_router() -> APIRouter:
    from .prepare import router as prepare_router

    router = APIRouter(prefix='/checkout', tags=['Checkout'])

    router.include_router(prepare_router)

    return router
