from fastapi import APIRouter


def get_connect_webhooks() -> APIRouter:
    
    router = APIRouter(prefix='/connect')
    
    return router
