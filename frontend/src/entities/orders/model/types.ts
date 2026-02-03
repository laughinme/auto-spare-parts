import type {
  OrderProductCondition,
  OrderProductOriginality,
  OrderProductStatus,
  OrderProductStockType,
  OrderSort,
  OrderStatus,
} from "@/entities/orders/api";

export type BuyerOrderProductMedia = {
  id: string;
  url: string;
  alt: string | null;
};

export type BuyerOrderProductMake = {
  id: number;
  name: string;
};

export type BuyerOrderProductOrganization = {
  id: string;
  name: string;
  country: string;
  address: string | null;
};

export type BuyerOrderProduct = {
  id: string;
  title: string;
  description: string | null;
  make: BuyerOrderProductMake | null;
  partNumber: string | null;
  price: number;
  stockType: OrderProductStockType;
  quantityOnHand: number;
  condition: OrderProductCondition;
  originality: OrderProductOriginality;
  allowCart: boolean;
  allowChat: boolean;
  status: OrderProductStatus;
  isInStock: boolean;
  isBuyable: boolean;
  media: BuyerOrderProductMedia[];
  organization: BuyerOrderProductOrganization;
  createdAt: string;
  updatedAt: string | null;
};

export type BuyerOrderSellerOrganization = {
  id: string;
  name: string;
  country: string;
  address: string | null;
};

export type BuyerOrderItemProductSnapshot = {
  title: string;
  description: string | null;
  makeId: number | null;
  makeName: string | null;
  partNumber: string | null;
  condition: OrderProductCondition | null;
};

export type BuyerOrderItem = {
  id: string;
  quantity: number;
  status: OrderStatus;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: BuyerOrderItemProductSnapshot;
  product: BuyerOrderProduct | null;
  sellerOrganization: BuyerOrderSellerOrganization | null;
  carrierCode: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

export type BuyerOrder = {
  id: string;
  buyerId: string;
  paymentStatus: OrderStatus;
  createdAt: string;
  updatedAt: string | null;
  totalAmount: number;
  totalItems: number;
  uniqueItems: number;
  orderProgress: number;
  notes: string | null;
  shippingAddress: string | null;
  shippedItems: number;
  deliveredItems: number;
  items: BuyerOrderItem[];
};

export type BuyerOrdersList = {
  items: BuyerOrder[];
  nextCursor: string | null;
};

export type UseBuyerOrdersParams = {
  statuses?: OrderStatus[];
  orderBy?: OrderSort;
  cursor?: string | null;
  limit?: number;
  enabled?: boolean;
};
