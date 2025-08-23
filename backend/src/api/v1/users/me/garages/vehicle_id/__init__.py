from fastapi import APIRouter


def get_garage_vehicle_router() -> APIRouter:
    from .delete import router as delete_router
    
    router = APIRouter(
        prefix='/{vehicle_id}',
        # tags=['Garage'],
        responses={404: {"description": "Vehicle with this id not found"}}
    )

    router.include_router(delete_router)
    
    return router
