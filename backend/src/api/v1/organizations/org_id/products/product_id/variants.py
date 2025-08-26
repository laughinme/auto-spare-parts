# from typing import Annotated
# from uuid import UUID
# from fastapi import APIRouter, Depends, Path, Query, HTTPException, Header

# from core.security import auth_user
# from database.relational_db import User
# from domain.products import (
#     ProductCreate,
#     ProductPatch,
#     ProductModel,
#     ProductStatus,
# )
# from service.products import ProductService, get_product_service

# router = APIRouter()


# @router.post(
#     path='/products/{product_id}/variants',
#     response_model=dict,
#     summary='Add product variant'
# )
# async def add_variant(
#     org_id: Annotated[UUID, Path(...)],
#     product_id: Annotated[UUID, Path(...)],
#     payload: VariantCreate,
#     _: Annotated[User, Depends(auth_user)],
#     svc: Annotated[ProductService, Depends(get_product_service)],
# ):
#     p = await svc.get_product(product_id)
#     if p is None or p.org_id != org_id:
#         raise HTTPException(404, 'Product not found')
#     v = await svc.add_variant(p, payload)
#     return {"id": v.id, "sku": v.sku, "stock": v.stock, "price": ({"amount": float(v.price_amount), "currency": v.price_currency} if v.price_amount is not None else None)}


# @router.patch(
#     path='/products/{product_id}/variants/{variant_id}',
#     response_model=dict,
#     summary='Patch product variant'
# )
# async def patch_variant(
#     org_id: Annotated[UUID, Path(...)],
#     product_id: Annotated[UUID, Path(...)],
#     variant_id: Annotated[UUID, Path(...)],
#     payload: VariantPatch,
#     _: Annotated[User, Depends(auth_user)],
#     svc: Annotated[ProductService, Depends(get_product_service)],
# ):
#     p = await svc.get_product(product_id)
#     if p is None or p.org_id != org_id:
#         raise HTTPException(404, 'Product not found')
#     v = await svc.get_variant(variant_id)
#     if v is None or v.product_id != p.id:
#         raise HTTPException(404, 'Variant not found')
#     v = await svc.patch_variant(v, payload)
#     return {"id": v.id, "sku": v.sku, "stock": v.stock, "price": ({"amount": float(v.price_amount), "currency": v.price_currency} if v.price_amount is not None else None)}