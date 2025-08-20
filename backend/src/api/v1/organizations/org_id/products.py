from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, Query, Header

from core.security import auth_user
from database.relational_db import User
from domain.products import (
    ProductCreate,
    ProductModel,
    ProductStatus,
)
from domain.common import Page
from service.products import ProductService, get_product_service

router = APIRouter()


@router.post(
    path='/products',
    response_model=ProductModel,
    summary='Create product in organization'
)
async def create_product(
    payload: ProductCreate,
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
    idempotency_key: str | None = Header(default=None, alias='Idempotency-Key', description="Idempotency key"),
):
    """Create a new product in organization"""
    # TODO: add organization membership check
    product = await svc.create_product(org_id, payload, idempotency_key=idempotency_key)
    return product  # FastAPI automatically serializes


@router.get(
    path='/products',
    response_model=Page[ProductModel],
    summary='List organization products'
)
async def list_org_products(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    _: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
    offset: int = Query(0, ge=0, description="Offset from start"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    status: ProductStatus | None = Query(None, description="Filter by status"),
    q: str | None = Query(None, description="Search query"),
):
    """Get organization products list with filters and pagination"""
    # TODO: add organization access check
    items, total = await svc.list_org_products(org_id, offset=offset, limit=limit, status=status, search=q)
    return Page[ProductModel].model_validate({
        "items": items,
        "offset": offset,
        "limit": limit,
        "total": total,
    })
