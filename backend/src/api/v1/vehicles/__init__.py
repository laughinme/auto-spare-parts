from fastapi import APIRouter


def get_vehicles_router() -> APIRouter:
    from .makes import get_makes_router
    from .models import get_models_router
    from .years import get_years_router
    
    router = APIRouter(
        prefix='/vehicles',
        tags=['Vehicles'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(get_makes_router())
    router.include_router(get_models_router())
    router.include_router(get_years_router())
    
    return router
