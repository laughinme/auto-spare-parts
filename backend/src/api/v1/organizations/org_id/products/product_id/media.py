from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, HTTPException, UploadFile, File

from core.security import auth_user
from database.relational_db import User
from domain.products import ProductModel, MediaCreate
from core.config import Settings
from service.products import ProductService, get_product_service

router = APIRouter()
config = Settings() # pyright: ignore[reportCallIssue]


@router.put(
    path='/media',
    response_model=ProductModel,
    summary='Upload product photo(s)'
)
async def upload_product_photos(
    files: Annotated[list[UploadFile], File(..., description=f"JPEG or PNG files (max {config.MAX_PHOTO_SIZE} MB each). Can upload multiple files.")],
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    """Upload one or more photos for product"""
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    if product.organization.owner_user_id != user.id:
        raise HTTPException(403, 'You do not have access to this product')
    
    # Support both single file and multiple files
    if len(files) == 1:
        await svc.add_product_photo(files[0], product)
    else:
        await svc.add_product_photos(files, product)
    
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
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    if product.organization.owner_user_id != user.id:
        raise HTTPException(403, 'You do not have access to this product')
    
    media = await svc.media_repo.get_by_id(media_id)
    if media is None or media.product_id != product.id:
        raise HTTPException(404, 'Media not found')
    await svc.delete_media(media)
