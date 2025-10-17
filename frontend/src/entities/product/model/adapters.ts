import type { CursorPageDto, ProductDto } from "@/shared/api/products";
import type { Product, ProductFeed } from "./types";

export const toProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  title: dto.title,
  price: Number(dto.price),
  imageUrl: dto.media?.[0]?.url,
  condition: dto.condition,
});

export const toProductFeed = (resp: CursorPageDto<ProductDto>): ProductFeed => ({
  items: resp.items.map(toProduct),
  nextCursor: resp.next_cursor ?? null,
});