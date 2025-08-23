from fastapi import APIRouter


def get_models_router() -> APIRouter:
    from .list import router as list_router
    
    router = APIRouter(
        prefix='/models',
    )

    router.include_router(list_router)
    
    return router
