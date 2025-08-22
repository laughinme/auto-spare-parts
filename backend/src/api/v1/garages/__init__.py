from fastapi import APIRouter


def get_public_garages_router() -> APIRouter:
    
    
    router = APIRouter(
        prefix='/garages',
        tags=['Garages'],
        responses={401: {"description": "Not authorized"}}
    )

    
    return router
