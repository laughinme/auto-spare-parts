from fastapi import APIRouter


def get_organizations_router() -> APIRouter:
    from .onboarding import router as onboarding_router
    from .creation import router as creation_router
    from .list_mine import router as list_mine_router
    from .org_id import get_org_id_router

    router = APIRouter(
        prefix='/organizations',
        tags=['Organizations'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(onboarding_router)
    router.include_router(creation_router)
    router.include_router(list_mine_router)
    router.include_router(get_org_id_router())
    
    return router
