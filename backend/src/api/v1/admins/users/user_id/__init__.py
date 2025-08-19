from fastapi import APIRouter


def get_user_id_router() -> APIRouter:
    from .ban import router as ban_router

    router = APIRouter(prefix='/{user_id}')
    
    router.include_router(ban_router)
    
    return router
