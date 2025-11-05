from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, HTTPException

from core.security import require
from domain.products import (
    ProductModel,
)
from service.products import ProductService, get_product_service

router = APIRouter()


@router.post(
    path='/publish',
    response_model=ProductModel,
    summary='Publish product'
)
async def publish_product(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    _: Annotated[None, Depends(require('admin', scope='org'))],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    """Publish product (make it visible in public catalog)"""
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    published_product = await svc.publish(product)
    return published_product


@router.post(
    path='/unpublish',
    response_model=ProductModel,
    summary='Unpublish product'
)
async def unpublish_product(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    _: Annotated[None, Depends(require('admin', scope='org'))],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    """Unpublish product (hide from public catalog)"""
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    unpublished_product = await svc.unpublish(product)
    return unpublished_product
