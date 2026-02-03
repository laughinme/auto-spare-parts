export type CartProductMedia = {
  id: string;
  url: string;
  alt?: string | null;
};
export type CartProductMake = {
  id: number;
  name: string;
};
export type CartProduct = {
  id: string;
  title: string;
  partNumber: string | null;
  make: CartProductMake | null;
  price: number;
  allowCart: boolean;
  media: CartProductMedia[];
};
export type CartItemStatus = "active" | "locked" | string;

export type CartItem = {
  id: string;
  quantity: number;
  status: CartItemStatus;
  unitPrice: number;
  totalPrice: number;
  product: CartProduct;
};
export type Cart = {
    id: string;
    items: CartItem[];
    userId: string;
    uniqueItems: number;
    totalItems: number;
    totalAmount: number;
}