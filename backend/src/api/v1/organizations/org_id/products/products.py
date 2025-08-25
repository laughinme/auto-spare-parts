from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Path, Query, Header, HTTPException

from core.security import auth_user
from database.relational_db import User
from domain.products import (
    ProductCreate,
    ProductModel,
    ProductStatus,
)
from domain.common import Page
from service.products import ProductService, get_product_service
from service.organizations import OrganizationService, get_organization_service

router = APIRouter()


@router.post(
    path='/',
    response_model=ProductModel,
    summary='Create new product'
)
async def create_product(
    payload: ProductCreate,
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
    org_svc: Annotated[OrganizationService, Depends(get_organization_service)],
    idempotency_key: str | None = Header(default=None, alias='Idempotency-Key', description="Idempotency key"),
):
    org = await org_svc.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if org.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this organization")
    
    product = await svc.create_product(org, payload, idempotency_key=idempotency_key)
    return product


@router.get(
    path='/',
    response_model=Page[ProductModel],
    summary='List organization products'
)
async def list_org_products(
    org_id: Annotated[UUID, Path(..., description="Organization ID")],
    user: Annotated[User, Depends(auth_user)],
    svc: Annotated[ProductService, Depends(get_product_service)],
    org_svc: Annotated[OrganizationService, Depends(get_organization_service)],
    offset: int = Query(0, ge=0, description="Offset from start"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    status: ProductStatus | None = Query(None, description="Filter by status"),
    q: str | None = Query(None, description="Search query"),
):
    org = await org_svc.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if org.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this organization")
    
    items, total = await svc.list_org_products(org_id, offset=offset, limit=limit, status=status, search=q)
    return {
        "items": items,
        "offset": offset,
        "limit": limit,
        "total": total,
    }
