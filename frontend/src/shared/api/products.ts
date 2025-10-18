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
  currency?: string
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

export type CatalogParams = {
  limit?: number;
  cursor?: string;
  q?: string | null;
  make_id?: number | null;
  condition?: 'new' | 'used' | null;
  originality?: 'oem' | 'aftermarket' | null;
  price_min?: number | string | null;
  price_max?: number | string | null;
};

const stripNil = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as T;

export async function getProductsCatalog(params: CatalogParams = {}) {
  const cleaned = stripNil(params); 
  const { data } = await apiProtected.get<CursorPageDto<ProductDto>>(
    '/products/catalog',
    { params: cleaned }         
  );
  return data;  
}

export type ProductDetailsDto = ProductDto & {
  description: string;
};

export async function getProductDetails(productId:string){
    const response = await apiProtected.get<ProductDetailsDto>(`/products/${productId}`);
    return response.data;
}
