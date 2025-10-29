import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AddToCart,
  type AddCartItemBody,
} from "@/shared/api/cart"
import type { CartSummaryModel } from "./useGetCartSummary"

const SUMMARY_KEY = ["cart-summary"] as const
const CART_ACTIVE_KEY = ["cart", false] as const
const CART_WITH_LOCKED_KEY = ["cart", true] as const

export function useAddToCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddCartItemBody) => AddToCart(payload),

    async onMutate({ quantity }) {
      await qc.cancelQueries({ queryKey: SUMMARY_KEY })

      const previousSummary = qc.getQueryData<CartSummaryModel>(SUMMARY_KEY)

      if (previousSummary) {
        qc.setQueryData<CartSummaryModel>(SUMMARY_KEY, {
          ...previousSummary,
          totalItems: previousSummary.totalItems + quantity,
        })
      }

      return { previousSummary }
    },

    onError(_error, _vars, context) {
      if (context?.previousSummary) {
        qc.setQueryData(SUMMARY_KEY, context.previousSummary)
      }
    },

    onSettled() {
      qc.invalidateQueries({ queryKey: SUMMARY_KEY })
      qc.invalidateQueries({ queryKey: CART_ACTIVE_KEY })
      qc.invalidateQueries({ queryKey: CART_WITH_LOCKED_KEY })
    },
  })
}
