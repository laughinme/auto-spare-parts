import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { OrderPreparePayload, StripeHostedCheckoutResponse } from "@/entities/orders/api";
import { prepareStripeHostedCheckout } from "@/entities/orders/api";

const getCheckoutErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data;
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail;
    }
    if (detail && typeof detail === "object" && "detail" in detail) {
      const message = (detail as { detail?: unknown }).detail;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось подготовить заказ к оплате";
};

export const useStripeHostedCheckout = () =>
  useMutation<StripeHostedCheckoutResponse, unknown, OrderPreparePayload>({
    mutationFn: prepareStripeHostedCheckout,
    onError: (error) => {
      toast.error(getCheckoutErrorMessage(error));
    },
  });
