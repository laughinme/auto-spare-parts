from fastapi import APIRouter


def get_org_id_router() -> APIRouter:
    from .get import router as get_router
    from .products import router as products_router
    from .product_id import get_product_id_router

    router = APIRouter(
        prefix='/{org_id}',
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(get_router)
    router.include_router(products_router)
    router.include_router(get_product_id_router())

    return router
