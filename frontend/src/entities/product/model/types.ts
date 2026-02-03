export type Product = {
  id: string;
  title: string;
  price: number;
  qty: number;
  imageUrl?: string;
  condition: string;
  currency?: string;
};

export type ProductFeed = { 
    items: Product[];
    nextCursor: string | null 
};
export type ProductDetail = {
  id: string;
  title: string;
  price: number;
  qty: number;
  imageUrl?: string;
  condition: string;
  currency?: string;
  description: string;
};
