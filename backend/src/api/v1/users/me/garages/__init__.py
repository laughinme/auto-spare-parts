from fastapi import APIRouter


def get_garages_router() -> APIRouter:
    from .create import router as create_router
    
    router = APIRouter(
        prefix='/garage',
        # tags=['Garage'],
        responses={401: {"description": "Not authorized"}}
    )

    router.include_router(create_router)
    
    return router
