import type { CursorPageDto, ProductDetailsDto, ProductDto } from "@/shared/api/products";
import type { Product, ProductDetail, ProductFeed } from "./types";

export const toProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  title: dto.title,
  price: Number(dto.price),
  imageUrl: dto.media?.[0]?.url,
  condition: dto.condition,
  currency: dto.currency ?? undefined,
  qty: dto.quantity_on_hand,
});

export const toProductFeed = (resp: CursorPageDto<ProductDto>): ProductFeed => ({
  items: resp.items.map(toProduct),
  nextCursor: resp.next_cursor ?? null,
});

export const toProductDetails = (dto: ProductDetailsDto): ProductDetail => ({
  id: dto.id,
  title: dto.title,
  price: Number(dto.price),
  qty: dto.quantity_on_hand ?? 0,
  imageUrl: dto.media?.[0]?.url,
  condition: dto.condition,
  currency: dto.currency ?? undefined,
  description: dto.description,
});
