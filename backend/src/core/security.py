import jwt

from typing import Annotated
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database.relational_db import User
from service.auth import TokenService, get_token_service
from service.users import UserService, get_user_service

security = HTTPBearer(
    description='Access token must be passed as Bearer to authorize request'
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
        payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad refresh token passed")
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
    
    user_id = payload['sub']
    user = await user_svc.get_user(user_id)
    if user is None:
        raise HTTPException(401, detail="Not Authorized")
    if user.banned:
        raise HTTPException(403, detail="Your account is banned, contact support: laughinmee@gmail.com")
    
    return user

async def auth_admin(
    user: Annotated[User, Depends(auth_user)],
) -> User:
    if not user.is_admin:
        raise HTTPException(403, detail="You don't have permission to do this")
    
    return user
