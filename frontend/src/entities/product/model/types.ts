export type Product = {
  id: string;
  title: string;
  price: number; 
  imageUrl?: string;
  condition: string;
  currency?: string;
};

export type ProductFeed = { 
    items: Product[];
    nextCursor: string | null 
};
