import apiProtected from "./axiosInstance"

export type GetCartParams = {
  include_locked?: boolean
}

export type CartItemDto = {
  id: string
  quantity: number
  status: "active" | "locked" | string
  unit_price: string
  total_price: string
  product: {
    id: string
    title: string
    part_number: string | null
    make?: { make_id: number; make_name: string } | null
    price: string
    allow_cart: boolean
    media?: { id: string; url: string; alt?: string | null }[]
  }
}

export type CartDto = {
  id: string
  user_id: string
  items: CartItemDto[]
  unique_items: number
  total_items: number
  total_amount: string
}

export async function getCart(params: GetCartParams = {}) {
  const response = await apiProtected.get<CartDto>("/cart/", { params });
  return response.data;
}

export type AddCartItemBody = {
    product_id: string
    quantity: number
}

export async function AddToCart(body: AddCartItemBody) {
    const response = await apiProtected.post<CartDto>('cart/items/', body );
    return response.data;
}