import aiofiles
import shutil
from uuid import UUID, uuid4
from pathlib import Path
from fastapi import UploadFile, status, HTTPException
from redis.asyncio import Redis

from core.config import Settings
from database.relational_db import (
    UoW,
    ProductsInterface,
    ProductMediaInterface,
    Product,
    ProductMedia,
)
from domain.products import (
    ProductCreate,
    ProductPatch,
    MediaCreate,
    ProductStatus,
)


settings = Settings() # type: ignore

class ProductService:
    """Service for working with products"""
    
    def __init__(
        self,
        uow: UoW,
        products_repo: ProductsInterface,
        media_repo: ProductMediaInterface,
        redis: Redis | None = None,
    ):
        self.uow = uow
        self.products_repo = products_repo
        self.media_repo = media_repo
        self.redis = redis

    async def create_product(self, org_id: UUID | str, payload: ProductCreate, *, idempotency_key: str | None = None) -> Product:
        """Create a new product"""
        # Simple idempotency via Redis (optional)
        if idempotency_key and self.redis:
            key = f"idem:product:create:{org_id}:{idempotency_key}"
            was_set = await self.redis.set(name=key, value="1", nx=True, ex=60)
            if not was_set:
                raise ValueError("Idempotency key already used")

        # Create product from payload
        product = Product(
            org_id=org_id,
            brand=payload.brand,
            part_number=payload.part_number,
            price=payload.price,
            condition=payload.condition,
            description=payload.description,
            status=payload.status,
        )

        await self.products_repo.add(product)
        await self.uow.commit()
        await self.uow.session.refresh(product)
        return product

    async def list_org_products(
        self,
        org_id: UUID | str,
        *,
        offset: int,
        limit: int,
        status: ProductStatus | None,
        search: str | None,
    ) -> tuple[list[Product], int]:
        """Get organization products list with filters and pagination"""
        return await self.products_repo.list_by_org(
            org_id, 
            offset=offset, 
            limit=limit, 
            status=status, 
            search=search
        )

    async def get_product(self, product_id: UUID | str) -> Product | None:
        """Get product by ID"""
        return await self.products_repo.get_by_id(product_id)

    async def patch_product(self, product: Product, payload: ProductPatch) -> Product:
        """Update product"""
        data = payload.model_dump(exclude_none=True)
        for field, value in data.items():
            setattr(product, field, value)
        await self.uow.commit()
        await self.uow.session.refresh(product)
        return product

    async def delete_product(self, product: Product) -> None:
        """Delete product"""
        await self.products_repo.delete(product.id)
        await self.uow.commit()

    async def publish(self, product: Product) -> Product:
        """Publish product"""
        product.status = ProductStatus.PUBLISHED
        await self.uow.commit()
        await self.uow.session.refresh(product)
        return product

    async def unpublish(self, product: Product) -> Product:
        """Unpublish product"""
        product.status = ProductStatus.DRAFT
        await self.uow.commit()
        await self.uow.session.refresh(product)
        return product

    async def add_media(self, product: Product, payload: MediaCreate) -> ProductMedia:
        """Add media file to product"""
        media = ProductMedia(product_id=product.id, url=payload.url, alt=payload.alt)
        await self.media_repo.add(media)
        await self.uow.commit()
        await self.uow.session.refresh(media)
        return media

    async def delete_media(self, media: ProductMedia) -> None:
        """Delete media file"""
        await self.media_repo.delete(media.id)
        await self.uow.commit()

    async def add_product_photo(
        self,
        file: UploadFile,
        product: Product
    ) -> None:
        """Add photo to product (similar to user picture upload)"""
        
        # Validate file type
        if file.content_type not in ['image/jpeg', 'image/png']:
            raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Only JPEG and PNG files are allowed")
        
        # Validate file size
        if file.size and file.size > settings.MAX_PHOTO_SIZE * 1024 * 1024:
            raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"File size exceeds {settings.MAX_PHOTO_SIZE} MB")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
        unique_filename = f"{uuid4()}.{file_extension}"
        
        # Create directory structure
        product_media_dir = Path(settings.MEDIA_DIR) / "products" / str(product.id)
        product_media_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_path = product_media_dir / unique_filename
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                shutil.copyfileobj(file.file, f)
        except Exception as e:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, f"Could not save file: {str(e)}")
        
        # Create media record
        media_url = f"/media/products/{product.id}/{unique_filename}"
        media = ProductMedia(
            product_id=product.id,
            url=media_url,
            alt=f"{product.brand} {product.part_number} photo"
        )
        
        await self.media_repo.add(media)
        await self.uow.commit()
