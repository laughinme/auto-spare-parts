import logging

from pathlib import Path
from pydantic import SecretStr, Field, AliasChoices

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR  = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """
    Project dependencies config
    """
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        extra='ignore'
    )
    
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
    JWT_PRIVATE_KEY: str
    JWT_PUBLIC_KEY: str
    JWT_ALGO: str = 'RS256'
    ACCESS_TTL: int = 60 * 15
    REFRESH_TTL: int = 60 * 60 * 24 * 7
    CSRF_HMAC_KEY: bytes
    
    # Database settings
    DATABASE_URL: str
    REDIS_URL: str


def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(filename)s:%(lineno)d] %(message)s",
    )
