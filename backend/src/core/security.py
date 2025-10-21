import jwt
import json
from uuid import UUID
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.rbac import PERMISSIONS_CACHE_TTL_SECONDS, permissions_cache_key, ROLES_CACHE_TTL_SECONDS, roles_cache_key
from database.redis import CacheRepo, get_redis
from database.relational_db import User
from service.auth import TokenService, get_token_service
from service.users import UserService, get_user_service

security = HTTPBearer(
    description="Access token must be passed as Bearer to authorize request"
)

async def extract_jti(request: Request) -> str:
    token = request.cookies.get("refresh_token")
    if not token:
        auth = request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing refresh token")
    try:
        payload = jwt.decode(
            token, options={"verify_signature": False, "verify_exp": False}
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Bad refresh token passed"
        ) from exc
    jti = payload.get("jti")
    if not jti:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad refresh token passed")
    return jti

async def auth_user(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    token_svc: Annotated[TokenService, Depends(get_token_service)],
    user_svc: Annotated[UserService, Depends(get_user_service)],
) -> User:
    payload = await token_svc.verify_access(creds.credentials)
    if payload is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad access token passed")

    user_id = payload["sub"]
    user = await user_svc.get_user(user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not Authorized")
    if user.banned:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="Your account is banned, contact support: laughinmee@gmail.com",
        )

    token_version = payload.get("av")
    if token_version is None or int(token_version) != int(user.auth_version):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Access token expired, please sign in again",
        )

    return user


async def load_cached_roles(user: User) -> list[str]:
    cache_repo = CacheRepo(get_redis())

    roles = await cache_repo.get(roles_cache_key(user.id, user.auth_version))
    
    if roles is None:
        roles_slugs = user.role_slugs
    else:
        roles_slugs = json.loads(roles)
        
        await cache_repo.set(roles_cache_key(user.id, user.auth_version), json.dumps(roles_slugs), ttl=ROLES_CACHE_TTL_SECONDS)
        
    return roles_slugs


def require(*roles: str):
    expected = {role for role in roles}

    async def dependency(user: Annotated[User, Depends(auth_user)]) -> None:
        
        roles_slugs = await load_cached_roles(user)
        
        if not expected.issubset(set(roles_slugs)):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to do this",
            )

    return dependency
