from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException

from domain.products import ProductModel, ProductCondition
from domain.common import Page, CursorPage
from service.products import ProductService, get_product_service

router = APIRouter()


# @router.get(
#     path='/catalog',
#     response_model=Page[ProductModel],
#     summary='Public product catalog with advanced search and filters',
#     include_in_schema=False,
# )
# async def search_products(
#     svc: Annotated[ProductService, Depends(get_product_service)],
#     offset: int = Query(0, ge=0, description="Offset from start"),
#     limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
#     q: str | None = Query(None, description="Search query (brand, part number, description)"),
#     brand: str | None = Query(None, description="Filter by brand"),
#     condition: ProductCondition | None = Query(None, description="Filter by condition"),
#     price_min: float | None = Query(None, ge=0, description="Minimum price filter"),
#     price_max: float | None = Query(None, ge=0, description="Maximum price filter"),
# ):
#     """
#     Public product catalog with advanced search and filtering:
#     - Text search across brand, part number, description
#     - Filter by brand, condition, price range
#     - Only returns published products
#     """
#     items, total = await svc.search_published_products(
#         offset=offset,
#         limit=limit,
#         search=q,
#         brand=brand,
#         condition=condition.value if condition else None,
#         price_min=price_min,
#         price_max=price_max,
#     )
    
#     return {
#         "items": items,
#         "offset": offset,
#         "limit": limit,
#         "total": total,
#     }


# @router.get(
#     path='/feed',
#     response_model=Page[ProductModel],
#     summary='Product feed (For You Page) with offset/limit pagination',
#     include_in_schema=False,
# )
# async def get_products_feed(
#     svc: Annotated[ProductService, Depends(get_product_service)],
#     offset: int = Query(0, ge=0, description="Offset from start"),
#     limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
# ):
#     """
#     Product feed (For You Page) with traditional offset/limit pagination:
#     - Currently shows latest published products
#     - Later: personalized recommendations, trending items
#     """
#     items, total = await svc.get_feed_products(
#         offset=offset,
#         limit=limit,
#     )
    
#     return {
#         "items": items,
#         "offset": offset,
#         "limit": limit,
#         "total": total,
#     }


@router.get(
    path='/catalog',
    response_model=CursorPage[ProductModel],
    summary='Product catalog search with cursor pagination'
)
async def search_products_cursor(
    svc: Annotated[ProductService, Depends(get_product_service)],
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items"),
    cursor: str | None = Query(None, description="Simple cursor (timestamp_uuid)"),
    q: str | None = Query(None, description="Search query (brand, part number, description)"),
    brand: str | None = Query(None, description="Filter by brand"),
    condition: ProductCondition | None = Query(None, description="Filter by condition"),
    price_min: float | None = Query(None, ge=0, description="Minimum price filter"),
    price_max: float | None = Query(None, ge=0, description="Maximum price filter"),
):
    """
    Product catalog search with cursor pagination (same pattern as admin users):
    - Cursor format: "2024-01-20T10:30:00_uuid-here"
    - More efficient for infinite scroll search results
    - Full search and filtering capabilities
    """
    products, next_cursor = await svc.search_published_products_cursor(
        limit=limit,
        search=q,
        brand=brand,
        condition=condition.value if condition else None,
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
    """
    Product feed with simple cursor pagination (same pattern as admin users):
    - Cursor format: "2024-01-20T10:30:00_uuid-here"
    - More efficient than offset/limit for infinite scroll
    - Currently shows latest published products
    """
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
    """Get public product details (only published products)"""
    product = await svc.get_published_product(product_id)
    if product is None:
        raise HTTPException(404, 'Product not found or not published')
    return product
