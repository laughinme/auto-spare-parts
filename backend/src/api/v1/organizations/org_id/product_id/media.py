from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, HTTPException, UploadFile, File

from core.security import auth_user
from database.relational_db import User
from domain.products import ProductModel
from core.config import Settings
from service.products import ProductService, get_product_service

router = APIRouter()
config = Settings() # pyright: ignore[reportCallIssue]


@router.put(
    path='/media',
    response_model=ProductModel,
    summary='Upload product photo'
)
async def upload_product_photo(
    file: Annotated[UploadFile, File(..., description=f"JPEG or PNG files (max {config.MAX_PHOTO_SIZE} MB)")],
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    """Upload photo for product"""
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    await svc.add_product_photo(file, product)
    return product


@router.delete(
    path='/media/{media_id}',
    summary='Delete product media file',
    status_code=204
)
async def delete_media(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    media_id: Annotated[UUID, Path(..., description="Media file ID")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    
    media = await svc.media_repo.get_by_id(media_id)
    if media is None or media.product_id != product.id:
        raise HTTPException(404, 'Media not found')
    await svc.delete_media(media)
