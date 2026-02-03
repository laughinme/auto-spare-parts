from uuid import UUID, uuid4
from decimal import Decimal
from datetime import datetime
from fastapi import UploadFile, status, HTTPException
from redis.asyncio import Redis
from sqlalchemy.exc import IntegrityError

from utils.cursor import parse_cursor, create_cursor
from core.config import Settings
from core.media_storage import get_media_storage
from database.relational_db import (
    UoW,
    ProductsInterface,
    ProductMediaInterface,
    Product,
    ProductMedia,
    Organization,
    CartItemInterface,
)
from domain.products import (
    ProductCreate,
    ProductPatch,
    MediaCreate,
    ProductStatus,
    ProductCondition,
    ProductOriginality,
    StockType,
    AdjustStock,
)

settings = Settings() # type: ignore
media_storage = get_media_storage()

class ProductService:
    """Service for working with products"""
    
    def __init__(
        self,
        uow: UoW,
        products_repo: ProductsInterface,
        media_repo: ProductMediaInterface,
        carts_repo: CartItemInterface,
        redis: Redis | None = None,
    ):
        self.uow = uow
        self.products_repo = products_repo
        self.media_repo = media_repo
        self.carts_repo = carts_repo
        self.redis = redis
    
    @staticmethod
    def _validate_product_integrity(product: Product) -> None:
        if product.stock_type == StockType.UNIQUE:
            if product.allow_cart:
                raise ValueError("Cart cannot be allowed for UNIQUE stock type")
            if product.quantity_on_hand != 1:
                raise ValueError("Quantity must be 1 for UNIQUE stock type")
        if product.status == ProductStatus.PUBLISHED:
            if product.quantity_on_hand <= 0:
                raise ValueError("Quantity must be greater than 0 for published products")
            if product.price <= 0:
                raise ValueError("Price must be greater than 0 for published products")
        if not product.allow_cart and not product.allow_chat:
            raise ValueError("Product must allow either cart or chat")

    async def create_product(
        self,
        org: Organization,
        payload: ProductCreate,
        *,
        idempotency_key: str | None = None
    ) -> Product:
        if idempotency_key and self.redis:
            key = f"idem:product:create:{org.id}:{idempotency_key}"
            was_set = await self.redis.set(name=key, value="1", nx=True, ex=60)
            if not was_set:
                raise ValueError("Idempotency key already used")

        product = Product(
            make_id=payload.make_id,
            title=payload.title,
            description=payload.description,
            part_number=payload.part_number,
            price=payload.price,
            condition=payload.condition,
            originality=payload.originality,
            stock_type=payload.stock_type,
            quantity_original=payload.quantity,
            quantity_on_hand=payload.quantity,
            status=payload.status,
            allow_cart=payload.allow_cart,
            allow_chat=payload.allow_chat,
        )
        org.products.append(product)
        try:
            self._validate_product_integrity(product)
            await self.uow.commit()
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail=f"Failed to add product to organization. Probably make_id is invalid")
        
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
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(product, field, value)
            
        if data.get('stock_type') is not None:
            if await self.carts_repo.product_id_exists(product.id):
                raise HTTPException(status_code=400, detail="Stock type cannot be changed for already reserved products")
            # TODO: check if there are any active orders for this product
        
        try:
            self._validate_product_integrity(product)
            await self.uow.commit()
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail=f"Failed to update product: {str(e)}")
        
        await self.uow.session.refresh(product)
        return product

    async def delete_product(self, product: Product) -> None:
        """Delete product"""
        await self.products_repo.delete(product.id)
        await self.uow.commit()

    async def publish(self, product: Product) -> Product:
        """Publish product"""
        product.status = ProductStatus.PUBLISHED
        try:
            self._validate_product_integrity(product)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        await self.uow.commit()
        await self.uow.session.refresh(product)
        return product

    async def unpublish(self, product: Product) -> Product:
        """Unpublish product"""
        product.status = ProductStatus.ARCHIVED
        
        # await self.uow.commit()
        # await self.uow.session.refresh(product)
        return product
    
    async def adjust_stock(self, product: Product, payload: AdjustStock) -> Product:
        """Adjust product stock"""
        product.quantity_on_hand += payload.delta
        if product.quantity_on_hand < 0:
            raise HTTPException(400, detail='Not enough stock')
        
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
        """Delete media file and remove from storage"""
        try:
            await media_storage.delete_by_url(media.url)
        except Exception:
            pass
        
        await self.media_repo.delete(media.id)

    async def add_product_photo(
        self,
        file: UploadFile,
        product: Product
    ) -> ProductMedia:
        """Add photo to product (using same approach as user picture upload)"""
        
        # Validate file type
        if file.content_type not in ("image/jpeg", "image/png"):
            raise HTTPException(
                status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Only JPEG and PNG files are allowed"
            )
        
        # Generate unique filename (same approach as user service)
        ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
        unique_filename = f"{uuid4().hex}{ext}"
        key = media_storage.build_key("products", str(product.id), unique_filename)

        try:
            media_url = await media_storage.save_upload(
                file,
                key=key,
                max_mb=settings.MAX_PHOTO_SIZE,
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save file: {str(e)}"
            )

        # Create media record
        media = ProductMedia(
            product_id=product.id,
            url=media_url,
            alt=f"{product.make.name} {product.part_number} photo"
        )
        
        await self.media_repo.add(media)
        await self.uow.commit()
        await self.uow.session.refresh(product)
        
        return media

    async def add_product_photos(
        self,
        files: list[UploadFile],
        product: Product
    ) -> list[ProductMedia]:
        """Add multiple photos to product"""
        media_files = []
        
        # Validate all files first before processing any
        for file in files:
            if file.content_type not in ("image/jpeg", "image/png"):
                raise HTTPException(
                    status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"File {file.filename}: Only JPEG and PNG files are allowed"
                )
        
        # Process each file
        for file in files:
            try:
                media = await self.add_product_photo(file, product)
                media_files.append(media)
            except Exception as e:
                # If any file fails, we still want to return the successful ones
                # But we should log or handle the error appropriately
                raise e  # For now, fail fast
        
        return media_files

    async def get_feed_products(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Product], int]:
        """Get products for feed (For You Page)"""
        return await self.products_repo.get_feed_products(
            offset=offset,
            limit=limit,
        )

    async def search_published_products_cursor(
        self,
        *,
        limit: int = 20,
        search: str | None = None,
        make_id: int | None = None,
        condition: ProductCondition | None = None,
        originality: ProductOriginality | None = None,
        price_min: Decimal | None = None,
        price_max: Decimal | None = None,
        cursor: str | None = None,
    ) -> tuple[list[Product], str | None]:
        """Search published products with cursor pagination (same pattern as admin users)"""
        products = await self.products_repo.search_published_products_cursor(
            limit=limit,
            search=search,
            make_id=make_id,
            condition=condition,
            originality=originality,
            price_min=price_min,
            price_max=price_max,
            **parse_cursor(cursor),
        )

        return products, create_cursor(products, limit)

    async def get_feed_products_cursor(
        self,
        *,
        limit: int = 20,
        cursor: str | None = None,
    ) -> tuple[list[Product], str | None]:
        """Get products for feed using cursor pagination (same pattern as admin users)"""
        products = await self.products_repo.get_feed_products_cursor(
            limit=limit,
            **parse_cursor(cursor),
        )
        
        return products, create_cursor(products, limit)

    async def get_published_product(self, product_id: UUID | str) -> Product | None:
        """Get published product by ID for public viewing"""
        product = await self.products_repo.get_by_id(product_id)
        if product and product.status == ProductStatus.PUBLISHED:
            return product
