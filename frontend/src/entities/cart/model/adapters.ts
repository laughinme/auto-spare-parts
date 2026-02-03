import type { CartDto, CartItemDto } from "@/entities/cart/api";
import type { Cart, CartItem, CartProduct } from "./types";

const toNumber = (value: string | number): number =>
  typeof value === "number" ? value : Number(value);

const toCartProduct = (dto: CartItemDto["product"]): CartProduct => ({
  id: dto.id,
  title: dto.title,
  partNumber: dto.part_number,
  make: dto.make
    ? { id: dto.make.make_id, name: dto.make.make_name }
    : null,
  price: toNumber(dto.price),
  allowCart: dto.allow_cart,
  media:
    dto.media?.map((media) => ({
      id: media.id,
      url: media.url,
      alt: media.alt ?? null,
    })) ?? [],
});

const toCartItem = (dto: CartItemDto): CartItem => ({
  id: dto.id,
  quantity: dto.quantity,
  status: dto.status,
  unitPrice: toNumber(dto.unit_price),
  totalPrice: toNumber(dto.total_price),
  product: toCartProduct(dto.product),
});

export const toCart = (dto: CartDto): Cart => ({
  id: dto.id,
  userId: dto.user_id,
  items: dto.items.map(toCartItem),
  uniqueItems: dto.unique_items,
  totalItems: dto.total_items,
  totalAmount: toNumber(dto.total_amount),
});
