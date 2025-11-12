import apiProtected from "./axiosInstance";

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
