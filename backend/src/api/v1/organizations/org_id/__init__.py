from fastapi import APIRouter


def get_org_id_router() -> APIRouter:
    from .get import router as get_router

    router = APIRouter(
        prefix='/{organization_id}',
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(get_router)

    return router
