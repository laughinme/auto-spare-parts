from fastapi import APIRouter


def get_vehicles_router() -> APIRouter:
    from .makes import get_makes_router
    
    router = APIRouter(
        prefix='/vehicles',
        tags=['Vehicles'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(get_makes_router())
    
    return router
