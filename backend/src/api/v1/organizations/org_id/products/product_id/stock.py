from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, HTTPException

from core.security import auth_user
from database.relational_db import User
from domain.products import (
    ProductModel,
    AdjustStock,
)
from service.products import ProductService, get_product_service

router = APIRouter()


@router.post(
    path='/adjust-stock',
    response_model=ProductModel,
    summary='Adjust product stock'
)
async def adjust_stock(
    payload: AdjustStock,
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    product_id: Annotated[UUID, Path(..., description="Product ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    """Adjust product stock (increase or decrease)"""
    product = await svc.get_product(product_id)
    if product is None or product.org_id != org_id:
        raise HTTPException(404, 'Product not found')
    if product.organization.owner_user_id != user.id:
        raise HTTPException(403, detail='You do not have access to this product')
    adjusted_product = await svc.adjust_stock(product, payload)
    return adjusted_product
