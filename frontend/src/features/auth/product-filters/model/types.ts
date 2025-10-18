export type FilterState = {
  q?: string; 
  make_id?: number | null;
  condition?: 'new' | 'used' | null;
  originality?: 'oem' | 'aftermarket' | null;
  price_min?: number | '' | null;
  price_max?: number | '' | null;
  limit?: number;
};