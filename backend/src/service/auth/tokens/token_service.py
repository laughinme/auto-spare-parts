import jwt
import hmac
import logging

from typing import Literal
from uuid import UUID, uuid4
from datetime import datetime, timedelta, UTC

from core.config import Settings
from database.redis import CacheRepo

config = Settings() # pyright: ignore[reportCallIssue]
logger = logging.getLogger(__name__)
PRIVATE_KEY = config.JWT_PRIVATE_KEY.encode()
PUBLIC_KEY = config.JWT_PUBLIC_KEY.encode()


class TokenService:
    def __init__(self, repo: CacheRepo):
        self.repo = repo
    
    @staticmethod 
    def _make_csrf(refresh_token: str) -> str:
        return hmac.new(config.CSRF_HMAC_KEY, refresh_token.encode(), "sha256").hexdigest()
    
    async def _verify_token(self, token: str) -> dict[str, str] | None:
        try: 
            payload = jwt.decode(token, PUBLIC_KEY, algorithms=[config.JWT_ALGO])
        except jwt.PyJWTError:
            logger.info('Failed to decode jwt')
            return
        
        jti = payload['jti']
        if await self.repo.exists(f"block:{jti}"):
            logger.info('Failed to verify JWT: this token is blocked')
            return
        
        return payload
    
    async def issue_tokens(
        self, 
        user_id: UUID | str, 
        src: Literal['web', 'mobile'] = 'web'
    ) -> tuple[str, str, str]:
        user_id = str(user_id)
        now = datetime.now(UTC)
        
        jti = uuid4().hex
        access_payload = {
            'sub': user_id,
            'jti': jti,
            'typ': 'access',
            'src': src,
            'iat': int(now.timestamp()),
            'exp': int((now + timedelta(seconds=config.ACCESS_TTL)).timestamp()),
        }
        access = jwt.encode(access_payload, PRIVATE_KEY, algorithm=config.JWT_ALGO)

        refresh_payload = {
            'sub': user_id,
            'jti': jti,
            'typ': 'refresh',
            'src': src,
            'iat': int(now.timestamp()),
            'exp': int((now + timedelta(seconds=config.REFRESH_TTL)).timestamp()),
        }
        refresh = jwt.encode(refresh_payload, PRIVATE_KEY, algorithm=config.JWT_ALGO)
        
        csrf = self._make_csrf(refresh)
        
        return access, refresh, csrf


    async def refresh_tokens(
        self, 
        refresh_token: str, 
        csrf: str | None = None
    ) -> tuple[str, str, str] | None:
        payload = await self._verify_token(refresh_token)
        if payload is None or payload['typ'] != 'refresh':
            return
        src = payload['src']
        
        if src == 'web':
            if csrf is None or not hmac.compare_digest(self._make_csrf(refresh_token), csrf):
                return
        elif src != 'mobile': 
            return
        
        jti = payload['jti']
        ttl = int(payload['exp']) - int(datetime.now(UTC).timestamp())
        await self.repo.set(f"block:{jti}", "1", ttl)
            
        user_id = payload['sub']
        return await self.issue_tokens(user_id, src)
        
        
    async def revoke(self, refresh_token: str) -> dict | None:
        payload = await self._verify_token(refresh_token)
        if payload is None or payload['typ'] != 'refresh':
            return
        
        ttl = int(payload['exp']) - int(datetime.now(UTC).timestamp())
        await self.repo.set(f"block:{payload['jti']}", "1", ttl)
        
        return payload


    async def verify_access(self, access_token: str) -> dict[str, str] | None:
        payload = await self._verify_token(access_token)
        if payload is None or payload['typ'] != 'access':
            logger.info('Failed to verify JWT: no payload or type is not "access"')
            return
        
        return payload
