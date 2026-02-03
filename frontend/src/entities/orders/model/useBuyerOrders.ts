import { useQuery } from "@tanstack/react-query";

import { getBuyerOrders, type OrdersListResponseDto } from "@/entities/orders/api";

import { toBuyerOrdersList } from "./adapters";
import type { BuyerOrdersList, UseBuyerOrdersParams } from "./types";

export const useBuyerOrders = ({
  statuses,
  orderBy = "created_at_desc",
  cursor,
  limit = 20,
  enabled = true,
}: UseBuyerOrdersParams = {}) =>
  useQuery<OrdersListResponseDto, unknown, BuyerOrdersList>({
    queryKey: ["buyer-orders", { statuses, orderBy, cursor, limit }],
    queryFn: () =>
      getBuyerOrders({
        statuses,
        orderBy,
        cursor,
        limit,
      }),
    enabled,
    select: toBuyerOrdersList,
    staleTime: 60_000,
  });
