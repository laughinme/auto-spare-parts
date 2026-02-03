import apiProtected, { apiPublic } from "@/shared/api/axiosInstance";

export type ProductsFeedParams = {
  limit?: number
  cursor?: string
}

export type ProductDto = {
  id: string
  title: string
  price: number
  condition: string
  quantity_on_hand: number
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
  const response = await apiProtected.get<CursorPageDto<ProductDto>>("/products/feed", {
    params: { limit, cursor },
  })
  return response.data
}

export type CatalogParams = {
  limit?: number;
  cursor?: string;
  q?: string;
  make_id?: number ;
  condition?: 'new' | 'used';
  originality?: 'oem' | 'aftermarket';
  price_min?: number | string ;
  price_max?: number | string ;
};



export async function getProductsCatalog(params: CatalogParams = {}) {
  const { data } = await apiProtected.get<CursorPageDto<ProductDto>>(
    '/products/catalog',
    { params }         
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
