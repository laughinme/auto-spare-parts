from fastapi import APIRouter


def get_v1_router() -> APIRouter:
    from .admins import get_admins_router
    from .auth import get_auth_routers
    from .users import get_users_router
    from .organizations import get_organizations_router
    from .misc import get_misc_router
    from .products import get_products_router
    
    router = APIRouter(prefix='/v1')

    router.include_router(get_admins_router())
    router.include_router(get_auth_routers())
    router.include_router(get_users_router())
    router.include_router(get_organizations_router())
    router.include_router(get_misc_router())
    router.include_router(get_products_router())
    
    return router
