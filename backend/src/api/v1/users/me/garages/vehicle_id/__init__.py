from fastapi import APIRouter


def get_garage_vehicle_router() -> APIRouter:
    from .crud import router as crud_router
    
    router = APIRouter(
        prefix='/{vehicle_id}',
        # tags=['Garage'],
        responses={
            404: {"description": "Vehicle with this id not found"},
            403: {"description": "You are not allowed to access this vehicle"}
        }
    )

    router.include_router(crud_router)
    
    return router
