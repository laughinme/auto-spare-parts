import apiProtected from "./axiosInstance";

export const ORDER_STATUSES = ["pending", "paid", "refunded", "failed", "cancelled", "expired"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SORTS = ["price_asc", "price_desc", "created_at_asc", "created_at_desc"] as const;
export type OrderSort = (typeof ORDER_SORTS)[number];

export type OrderProductCondition = "new" | "used";
export type OrderProductStockType = "unique" | "stock";
export type OrderProductOriginality = "oem" | "aftermarket";
export type OrderProductStatus = "draft" | "published" | "archived" | string;

export type OrderProductMediaDto = {
  id: string;
  url: string;
  alt: string | null;
};

export type OrderProductMakeDto = {
  make_id: number;
  make_name: string;
};

export type OrderProductOrganizationDto = {
  id: string;
  name: string;
  country: string;
  address: string | null;
};

export type OrderProductDto = {
  created_at: string;
  updated_at: string | null;
  id: string;
  title: string;
  description: string | null;
  make: OrderProductMakeDto | null;
  part_number: string | null;
  price: string;
  stock_type: OrderProductStockType;
  quantity_on_hand: number;
  condition: OrderProductCondition;
  originality: OrderProductOriginality;
  allow_cart: boolean;
  allow_chat: boolean;
  status: OrderProductStatus;
  is_in_stock: boolean;
  is_buyable: boolean;
  media: OrderProductMediaDto[];
  organization: OrderProductOrganizationDto;
};

export type OrderSellerOrganizationDto = {
  id: string;
  name: string;
  country: string;
  address: string | null;
};

export type OrderItemDto = {
  id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  status: OrderStatus;
  product_make_id: number | null;
  product_make_name: string | null;
  product_part_number: string | null;
  product_condition: OrderProductCondition | null;
  product_title: string;
  product_description: string | null;
  product: OrderProductDto | null;
  seller_organization: OrderSellerOrganizationDto | null;
  carrier_code: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

export type OrderDto = {
  created_at: string;
  updated_at: string | null;
  id: string;
  buyer_id: string;
  payment_status: OrderStatus;
  total_amount: string;
  total_items: number;
  unique_items: number;
  order_progress: number;
  notes: string | null;
  shipping_address: string | null;
  items: OrderItemDto[];
  shipped_items: number;
  delivered_items: number;
};

export type OrdersListResponseDto = {
  items: OrderDto[];
  next_cursor: string | null;
};

export type GetBuyerOrdersParams = {
  statuses?: OrderStatus[];
  orderBy?: OrderSort;
  cursor?: string | null;
  limit?: number;
};

export const getBuyerOrders = async (
  params: GetBuyerOrdersParams = {}
): Promise<OrdersListResponseDto> => {
  const { statuses, orderBy, cursor, limit } = params;
  const response = await apiProtected.get<OrdersListResponseDto>("/orders/", {
    params: {
      statuses: statuses && statuses.length > 0 ? statuses : undefined,
      order_by: orderBy,
      cursor: cursor ?? undefined,
      limit,
    },
  });
  return response.data;
};

export type OrderPreparePayload = {
  cart_item_ids: string[];
  shipping_address: string;
  notes?: string | null;
};

export type OrderPrepareResponse = {
  order_id: string;
  client_secret: string;
};

export type StripeHostedCheckoutResponse = {
  order_id: string;
  url: string;
};

export const prepareOrder = async (
  payload: OrderPreparePayload
): Promise<OrderPrepareResponse> => {
  const response = await apiProtected.post<OrderPrepareResponse>(
    "/orders/prepare",
    payload
  );
  return response.data;
};

export const prepareStripeHostedCheckout = async (
  payload: OrderPreparePayload
): Promise<StripeHostedCheckoutResponse> => {
  const response = await apiProtected.post<StripeHostedCheckoutResponse>(
    "/orders/prepare/stripe-hosted",
    payload
  );
  return response.data;
};
