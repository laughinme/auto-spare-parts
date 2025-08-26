from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException

from domain.products import ProductModel, ProductCondition, ProductOriginality
from domain.common import CursorPage
from service.products import ProductService, get_product_service

router = APIRouter()


@router.get(
    path='/catalog',
    response_model=CursorPage[ProductModel],
    summary='Product catalog search with cursor pagination'
)
async def search_products_cursor(
    svc: Annotated[ProductService, Depends(get_product_service)],
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    cursor: str | None = Query(None, description="Simple cursor (timestamp_uuid)"),
    q: str | None = Query(None, description="Search query (title, description, make, part number)"),
    make_id: int | None = Query(None, description="Filter by make"),
    condition: ProductCondition | None = Query(None, description="Filter by condition"),
    originality: ProductOriginality | None = Query(None, description="Filter by originality"),
    price_min: float | None = Query(None, ge=0, description="Minimum price filter"),
    price_max: float | None = Query(None, ge=0, description="Maximum price filter"),
):
    products, next_cursor = await svc.search_published_products_cursor(
        limit=limit,
        search=q,
        make_id=make_id,
        condition=condition,
        originality=originality,
        price_min=price_min,
        price_max=price_max,
        cursor=cursor,
    )
    
    return CursorPage(items=products, next_cursor=next_cursor)


@router.get(
    path='/feed',
    response_model=CursorPage[ProductModel],
    summary='Product feed with simple cursor pagination'
)
async def get_products_feed_cursor(
    svc: Annotated[ProductService, Depends(get_product_service)],
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    cursor: str | None = Query(None, description="Simple cursor (timestamp_uuid)"),
):
    products, next_cursor = await svc.get_feed_products_cursor(
        limit=limit,
        cursor=cursor,
    )
    
    return CursorPage(items=products, next_cursor=next_cursor)


@router.get(
    path='/{product_id}',
    response_model=ProductModel,
    summary='Public product details'
)
async def get_product_details(
    product_id: UUID,
    svc: Annotated[ProductService, Depends(get_product_service)],
):
    product = await svc.get_published_product(product_id)
    if product is None:
        raise HTTPException(404, 'Product not found or not published')
    return product
