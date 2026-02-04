import logging

from pathlib import Path
from typing import Literal
from pydantic import SecretStr, Field, AliasChoices, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """
    Project dependencies config
    """
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        extra='ignore'
    )
    
    # Stage / debug
    APP_STAGE: Literal["dev", "prod"] = "dev"
    DEBUG: bool | None = None

    # API settings
    API_PORT: int = 8080
    API_HOST: str = '0.0.0.0'
    
    # Site data (url, paths)
    SITE_URL: str = ''
    WEB_URL: str = 'https://localhost:5173'
    
    # Media settings
    MEDIA_BACKEND: str = Field(default='local', validation_alias=AliasChoices('MEDIA_BACKEND', 'MEDIA_STORAGE'))
    MEDIA_DIR: str = 'media'
    MEDIA_PUBLIC_BASE_URL: str | None = Field(
        default=None,
        validation_alias=AliasChoices('MEDIA_PUBLIC_BASE_URL', 'MEDIA_CDN_URL'),
    )
    MEDIA_BUCKET: str | None = Field(default=None, validation_alias=AliasChoices('MEDIA_BUCKET', 'BUCKET_NAME'))
    MEDIA_REGION: str | None = Field(default=None, validation_alias=AliasChoices('MEDIA_REGION', 'AWS_REGION'))
    MEDIA_ENDPOINT_URL: str | None = Field(
        default=None,
        validation_alias=AliasChoices('MEDIA_ENDPOINT_URL', 'AWS_ENDPOINT_URL_S3'),
    )
    MEDIA_ACCESS_KEY_ID: SecretStr | None = Field(
        default=None,
        validation_alias=AliasChoices('MEDIA_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID'),
    )
    MEDIA_SECRET_ACCESS_KEY: SecretStr | None = Field(
        default=None,
        validation_alias=AliasChoices('MEDIA_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY'),
    )
    MEDIA_PREFIX: str = ''
    MEDIA_S3_ADDRESSING_STYLE: str = 'virtual'
    MAX_PHOTO_SIZE: int = 20 # in MB
    
    # External services
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str = ''
    STRIPE_CONNECT_WEBHOOK_SECRET: str
    STRIPE_LOCAL_CONNECT_WEBHOOK_SECRET: str = ''
    
    # Auth Settings    
    JWT_PRIVATE_KEY: str | None = None
    JWT_PUBLIC_KEY: str | None = None
    JWT_PRIVATE_KEY_PATH: str | None = None
    JWT_PUBLIC_KEY_PATH: str | None = None
    JWT_ALGO: str = 'RS256'
    ACCESS_TTL: int = 60 * 15
    REFRESH_TTL: int = 60 * 60 * 24 * 7
    CSRF_HMAC_KEY: bytes = b"dev-change-me"

    # Cookie settings
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    COOKIE_DOMAIN: str | None = None
    COOKIE_PATH: str = "/"

    # CORS settings (optional, use only if you call backend directly)
    CORS_ALLOW_ORIGINS: str = ""
    CORS_ALLOW_ORIGIN_REGEX: str = ""
    
    # Database settings
    DATABASE_URL: str
    REDIS_URL: str

    @field_validator("COOKIE_SAMESITE", mode="before")
    @classmethod
    def _normalize_samesite(cls, value: str) -> str:
        if not isinstance(value, str):
            return value
        return value.strip().lower()

    @field_validator("CSRF_HMAC_KEY", mode="before")
    @classmethod
    def _ensure_bytes(cls, value: str | bytes) -> bytes:
        if isinstance(value, bytes):
            return value
        return str(value).encode()

    @model_validator(mode="after")
    def _load_jwt_keys(self) -> "Settings":
        if not self.JWT_PRIVATE_KEY and self.JWT_PRIVATE_KEY_PATH:
            private_path = Path(self.JWT_PRIVATE_KEY_PATH)
            if not private_path.is_absolute():
                private_path = BASE_DIR / private_path
            self.JWT_PRIVATE_KEY = private_path.read_text()
        if not self.JWT_PUBLIC_KEY and self.JWT_PUBLIC_KEY_PATH:
            public_path = Path(self.JWT_PUBLIC_KEY_PATH)
            if not public_path.is_absolute():
                public_path = BASE_DIR / public_path
            self.JWT_PUBLIC_KEY = public_path.read_text()
        if not self.JWT_PRIVATE_KEY or not self.JWT_PUBLIC_KEY:
            raise ValueError(
                "JWT keys are required. Provide JWT_PRIVATE_KEY/JWT_PUBLIC_KEY or JWT_*_PATH."
            )
        return self


def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(filename)s:%(lineno)d] %(message)s",
    )
