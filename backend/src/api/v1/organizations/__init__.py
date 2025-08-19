from fastapi import APIRouter


def get_organizations_router() -> APIRouter:
    from .onboarding import router as onboarding_router
    from .creation import router as creation_router
    from .get import router as get_router

    router = APIRouter(
        prefix='/organizations',
        tags=['Organizations'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(onboarding_router)
    router.include_router(creation_router)
    router.include_router(get_router)
    
    return router
