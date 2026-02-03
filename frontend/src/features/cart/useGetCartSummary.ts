import { useQuery } from "@tanstack/react-query"

import { getCartSummary } from "@/entities/cart/api"

export type CartSummaryModel = {
  totalItems: number
  totalAmount: number
}

export function useGetCartSummary() {
  return useQuery({
    queryKey: ["cart-summary"],
    queryFn: getCartSummary,
    select: (data): CartSummaryModel => ({
      totalItems: data.total_items,
      totalAmount: Number(data.total_amount),
    }),
    staleTime: 30_000,
  })
}
