from fastapi import APIRouter


def get_me_router() -> APIRouter:
    from .profile import router as profile_router
    from .picture import router as picture_router
    from .garages import get_garages_router
    
    router = APIRouter(prefix='/me')
    
    router.include_router(profile_router)
    router.include_router(picture_router)
    router.include_router(get_garages_router())
    
    return router
