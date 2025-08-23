from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi_limiter import FastAPILimiter
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware

from api import get_api_routers
from webhooks import get_webhooks
from core.config import Settings, configure_logging
from core.payments import init_stripe
from database.redis import get_redis
# from scheduler import init_scheduler


config = Settings() # pyright: ignore[reportCallIssue]

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis = get_redis()
    try:
        await FastAPILimiter.init(redis)
        configure_logging()
        init_stripe()
        yield   
    finally:
        await redis.aclose()


app = FastAPI(
    lifespan=lifespan,
    title='Hackathon',
    debug=True
)

# Mount static
app.mount('/media', StaticFiles(directory=config.MEDIA_DIR, check_dir=False), 'media')

# Including routers
app.include_router(get_api_routers())
app.include_router(get_webhooks())

@app.get('/')
@app.get('/ping')
async def ping():
    return {'status': 'operating'}


# Adding middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://localhost:5173",
    ],
    allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allow_headers=['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization', 'X-Client'],
    allow_credentials=True
)
