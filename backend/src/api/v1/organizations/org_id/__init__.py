from fastapi import APIRouter


def get_org_id_router() -> APIRouter:
    from .get import router as get_router
    from .products import get_products_router

    router = APIRouter(
        prefix='/{org_id}',
        responses={
            401: {"description": "Not authorized"},
            404: {"description": "Organization with this id not found"}
        }
    )

    router.include_router(get_router)
    router.include_router(get_products_router())

    return router
