from fastapi import APIRouter


def get_garages_router() -> APIRouter:
    from .create import router as create_router
    from .list import router as list_router
    from .vehicle_id import get_garage_vehicle_router
    
    router = APIRouter(
        prefix='/garage',
        # tags=['Garage'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(create_router)
    router.include_router(list_router)
    router.include_router(get_garage_vehicle_router())
    
    return router
