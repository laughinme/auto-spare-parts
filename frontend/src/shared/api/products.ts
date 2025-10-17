import axios from "axios";
import apiProtected, { apiPublic } from "./axiosInstance";

export type ProductsFeedParams = {
  limit?: number
  cursor?: string
}

export type ProductDto = {
id: string
  title: string
  price: number
  condition: string
  media: {
    id: string
    url: string
    alt: string | null
  }[]
}

export type CursorPageDto<T>={
    items: T[]
    next_cursor: string | null
}
export async function getProductsFeed({ limit = 20, cursor }: ProductsFeedParams = {}) {
  const { data } = await apiProtected.get<CursorPageDto<ProductDto>>("/products/feed", {
    params: { limit, cursor },
  })
  return data
}
