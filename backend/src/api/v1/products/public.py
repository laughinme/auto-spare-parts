from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException

from domain.products import ProductModel
from domain.common import Page
from service.products import ProductService, get_product_service

router = APIRouter()


@router.get(
    path='/',
    response_model=Page[ProductModel],
    summary='Public product catalog with filters and pagination'
)
async def list_products(
    svc: Annotated[ProductService, Depends(get_product_service)],
    offset: int = Query(0, ge=0, description="Offset from start"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    q: str | None = Query(None, description='Search query'),
    org_id: UUID | None = Query(None, description="Organization ID for filtering"),
):
    """Public product list. Currently requires org_id, global catalog will be added later."""
    # For MVP reuse org listing when org_id provided; global listing TBD
    if org_id is None:
        # Not implemented in MVP. Return empty page to keep contract.
        return Page[ProductModel].model_validate({
            "items": [], 
            "offset": offset, 
            "limit": limit, 
            "total": 0
        })
    
    items, total = await svc.list_org_products(org_id, offset=offset, limit=limit, status=None, search=q)
    return Page[ProductModel].model_validate({
        "items": items,  # FastAPI automatically serializes Product to ProductModel
        "offset": offset,
        "limit": limit,
        "total": total,
    })


@router.get(
    path='/{product_id}',
    response_model=ProductModel,
    summary='Public product details page'
)
async def get_product(
    product_id: UUID,
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    """Get product details for public viewing"""
    product = await svc.get_product(product_id)
    if product is None:
        raise HTTPException(404, 'Product not found')
    return product  # FastAPI automatically serializes Product to ProductModel


