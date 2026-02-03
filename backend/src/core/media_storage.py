from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlsplit

import asyncio
import aiofiles
import boto3
from botocore.config import Config as BotoConfig
from fastapi import HTTPException, status, UploadFile

from core.config import Settings


class MediaStorageError(RuntimeError):
    pass


@dataclass(slots=True)
class MediaStorage:
    settings: Settings
    _client: object | None = None
    _public_base_url: str | None = None

    def __post_init__(self) -> None:
        backend = self.settings.MEDIA_BACKEND.lower().strip()
        if backend not in {"local", "s3"}:
            raise MediaStorageError(f"Unsupported MEDIA_BACKEND: {backend}")

        if backend == "s3":
            self._client = self._build_s3_client()

        self._public_base_url = self._resolve_public_base_url()

    @property
    def backend(self) -> str:
        return self.settings.MEDIA_BACKEND.lower().strip()

    @property
    def public_base_url(self) -> str:
        if self._public_base_url is None:
            self._public_base_url = self._resolve_public_base_url()
        return self._public_base_url

    def _resolve_public_base_url(self) -> str:
        if self.settings.MEDIA_PUBLIC_BASE_URL:
            return self.settings.MEDIA_PUBLIC_BASE_URL.rstrip("/")
        if self.backend == "local":
            site = self.settings.SITE_URL.rstrip("/")
            media_dir = self.settings.MEDIA_DIR.strip("/")
            return f"{site}/{media_dir}"
        raise MediaStorageError("MEDIA_PUBLIC_BASE_URL is required when MEDIA_BACKEND=s3")

    def _prefix(self) -> str:
        return (self.settings.MEDIA_PREFIX or "").strip("/")

    def build_key(self, *parts: object) -> str:
        flat: list[str] = []
        for part in parts:
            if part is None:
                continue
            if isinstance(part, (list, tuple, set)):
                flat.extend([str(p) for p in part if p is not None])
            else:
                flat.append(str(part))

        cleaned = [p.strip("/") for p in flat if p.strip("/")]
        key = "/".join(cleaned)
        prefix = self._prefix()
        return f"{prefix}/{key}" if prefix else key

    def build_url(self, key: str) -> str:
        key = key.lstrip("/")
        return f"{self.public_base_url}/{key}"

    async def save_upload(
        self,
        file: UploadFile,
        *,
        key: str,
        max_mb: int,
    ) -> str:
        limit_bytes = max_mb * 1024 * 1024
        content = await file.read(limit_bytes + 1)
        if len(content) > limit_bytes:
            raise HTTPException(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max {max_mb} MB",
            )

        await self.upload_bytes(
            key,
            content,
            content_type=file.content_type,
        )
        return self.build_url(key)

    async def upload_bytes(
        self,
        key: str,
        content: bytes,
        *,
        content_type: str | None = None,
    ) -> None:
        key = key.lstrip("/")
        if self.backend == "local":
            path = Path(self.settings.MEDIA_DIR) / key
            path.parent.mkdir(parents=True, exist_ok=True)
            async with aiofiles.open(path, "wb") as out:
                await out.write(content)
            return

        await asyncio.to_thread(
            self._put_object,
            key,
            content,
            content_type,
        )

    async def delete_by_url(self, url: str | None) -> None:
        if not url:
            return
        key = self.key_from_url(url)
        if not key:
            return
        await self.delete_key(key)

    async def delete_key(self, key: str) -> None:
        key = key.lstrip("/")
        if self.backend == "local":
            path = Path(self.settings.MEDIA_DIR) / key
            if path.exists():
                path.unlink(missing_ok=True)
            return

        await asyncio.to_thread(self._delete_object, key)

    def key_from_url(self, url: str) -> str | None:
        clean_url = urlsplit(url)._replace(query="", fragment="").geturl()
        base = f"{self.public_base_url}/"
        if clean_url.startswith(base):
            return clean_url[len(base):].lstrip("/")

        media_marker = f"/{self.settings.MEDIA_DIR.strip('/')}/"
        if media_marker in clean_url:
            return clean_url.split(media_marker, 1)[1].lstrip("/")

        return None

    def _build_s3_client(self):
        bucket = self.settings.MEDIA_BUCKET
        region = self.settings.MEDIA_REGION
        endpoint = self.settings.MEDIA_ENDPOINT_URL
        access_key = self.settings.MEDIA_ACCESS_KEY_ID
        secret_key = self.settings.MEDIA_SECRET_ACCESS_KEY

        if not bucket:
            raise MediaStorageError("MEDIA_BUCKET is required when MEDIA_BACKEND=s3")
        access_value = access_key.get_secret_value() if access_key else None
        secret_value = secret_key.get_secret_value() if secret_key else None

        if not access_value or not secret_value:
            raise MediaStorageError("MEDIA_ACCESS_KEY_ID and MEDIA_SECRET_ACCESS_KEY are required when MEDIA_BACKEND=s3")
        if not endpoint:
            raise MediaStorageError("MEDIA_ENDPOINT_URL is required when MEDIA_BACKEND=s3")
        if not region:
            raise MediaStorageError("MEDIA_REGION is required when MEDIA_BACKEND=s3")

        addressing_style = (self.settings.MEDIA_S3_ADDRESSING_STYLE or "auto").strip().lower()
        s3_config = {"addressing_style": addressing_style}

        return boto3.client(
            "s3",
            region_name=region,
            endpoint_url=endpoint,
            aws_access_key_id=access_value,
            aws_secret_access_key=secret_value,
            config=BotoConfig(signature_version="s3v4", s3=s3_config),
        )

    def _put_object(self, key: str, content: bytes, content_type: str | None) -> None:
        if not self._client:
            raise MediaStorageError("S3 client is not configured")
        params: dict[str, object] = {
            "Bucket": self.settings.MEDIA_BUCKET,
            "Key": key,
            "Body": content,
        }
        if content_type:
            params["ContentType"] = content_type
        self._client.put_object(**params)  # type: ignore[arg-type]

    def _delete_object(self, key: str) -> None:
        if not self._client:
            raise MediaStorageError("S3 client is not configured")
        self._client.delete_object(  # type: ignore[arg-type]
            Bucket=self.settings.MEDIA_BUCKET,
            Key=key,
        )


@lru_cache
def get_media_storage() -> MediaStorage:
    return MediaStorage(Settings())
