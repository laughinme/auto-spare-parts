from fastapi import Depends
from redis.asyncio import Redis

from database.redis import CacheRepo, get_redis
from .token_service import TokenService


async def get_token_service(
    redis: Redis = Depends(get_redis)
) -> TokenService:
    cache_repo = CacheRepo(redis)
    return TokenService(cache_repo)
