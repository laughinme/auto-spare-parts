import jwt
import json
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from core.rbac import ROLES_CACHE_TTL_SECONDS, roles_cache_key
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

async def parse_token(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    token_svc: Annotated[TokenService, Depends(get_token_service)],
) -> dict[str, int | str]:
    payload = await token_svc.verify_access(creds.credentials)
    if payload is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad access token passed")
    
    return payload

async def auth_user(
    payload: Annotated[dict[str, int | str], Depends(parse_token)],
    svc: Annotated[UserService, Depends(get_user_service)],
) -> User:
    user_id = str(payload["sub"])
    user = await svc.get_user(user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not Authorized")
    if user.banned:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail="Your account is banned, contact support: laughinmee@gmail.com",
        )

    return user


async def load_cached_roles(user: User) -> list[str]:
    cache_repo = CacheRepo(get_redis())

    roles = await cache_repo.get(roles_cache_key(user.id, user.auth_version))
    
    if roles is not None:
        return json.loads(roles)
    
    roles_slugs = user.role_slugs
    await cache_repo.set(roles_cache_key(user.id, user.auth_version), json.dumps(roles_slugs), ttl=ROLES_CACHE_TTL_SECONDS)

    return roles_slugs


def require(*roles: str):
    expected = {role for role in roles}

    async def dependency(
        payload: Annotated[dict[str, int | str], Depends(parse_token)],
        user: Annotated[User, Depends(auth_user)]
    ) -> None:
        
        token_version = payload.get("av")
        if token_version is None or int(token_version) != int(user.auth_version):
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                detail="Access token expired, please sign in again",
            )
        
        roles_slugs = await load_cached_roles(user)
        
        if not expected.issubset(set(roles_slugs)):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to do this",
            )

    return dependency
