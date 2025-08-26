from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, HTTPException

from core.security import auth_user
from database.relational_db import User
from domain.products import (
    ProductPatch,
    ProductModel,
)
from service.products import ProductService, get_product_service

router = APIRouter()

@router.get(
    path='/',
    response_model=ProductModel,
    summary='Get organization product details'
)
async def get_org_product(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    if product.organization.owner_user_id != user.id:
        raise HTTPException(403, detail='You do not have access to this product')
    return product


@router.patch(
    path='/',
    response_model=ProductModel,
    summary='Update organization product'
)
async def patch_org_product(
    payload: ProductPatch,
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    if product.organization.owner_user_id != user.id:
        raise HTTPException(403, detail='You do not have access to this product')
    updated_product = await svc.patch_product(product, payload)
    return updated_product


@router.delete(
    path='/',
    summary='Delete organization product',
    status_code=204,
    deprecated=True,
)
async def delete_org_product(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    pass
    # product = await svc.get_product(product_id)
    # if product is None or product.org_id != org_id:
    #     raise HTTPException(404, 'Product not found')
    # await svc.delete_product(product)
