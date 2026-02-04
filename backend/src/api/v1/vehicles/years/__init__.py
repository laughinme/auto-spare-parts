from fastapi import APIRouter


def get_years_router() -> APIRouter:
    from .list import router as list_router

    router = APIRouter()

    router.include_router(list_router)
    
    return router
