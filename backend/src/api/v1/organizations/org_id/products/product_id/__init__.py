from fastapi import APIRouter


def get_product_id_router() -> APIRouter:
    # from .variants import router as variants_router
    from .media import router as media_router
    from .publish import router as publish_router

    router = APIRouter(
        prefix='/products/{product_id}',
        responses={401: {"description": "Not authorized"}},
        # tags=['Products'],
    )

    # router.include_router(variants_router)
    router.include_router(media_router)
    router.include_router(publish_router)

    return router
