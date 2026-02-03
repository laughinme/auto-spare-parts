import { useMutation, useQueryClient } from "@tanstack/react-query"

import { clearCart } from "@/entities/cart/api"
import type { Cart } from "@/entities/cart/model/types"
import type { CartSummaryModel } from "./useGetCartSummary"

const SUMMARY_KEY = ["cart-summary"] as const
const CART_ACTIVE_KEY = ["cart", false] as const
const CART_WITH_LOCKED_KEY = ["cart", true] as const

type CartUpdater = (cart: Cart | undefined) => Cart | undefined

export function useClearCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: clearCart,

    async onMutate() {
      await Promise.all([
        qc.cancelQueries({ queryKey: SUMMARY_KEY }),
        qc.cancelQueries({ queryKey: CART_ACTIVE_KEY }),
        qc.cancelQueries({ queryKey: CART_WITH_LOCKED_KEY }),
      ])

      const previousSummary = qc.getQueryData<CartSummaryModel>(SUMMARY_KEY)
      const previousActiveCart = qc.getQueryData<Cart>(CART_ACTIVE_KEY)
      const previousCartWithLocked = qc.getQueryData<Cart>(CART_WITH_LOCKED_KEY)

      qc.setQueryData<CartSummaryModel | undefined>(SUMMARY_KEY, (data) =>
        data
          ? {
              ...data,
              totalItems: 0,
              totalAmount: 0,
            }
          : data
      )

      const makeEmptyCart: CartUpdater = (cart) =>
        cart
          ? {
              ...cart,
              items: [],
              uniqueItems: 0,
              totalItems: 0,
              totalAmount: 0,
            }
          : cart

      qc.setQueryData<Cart | undefined>(CART_ACTIVE_KEY, makeEmptyCart)
      qc.setQueryData<Cart | undefined>(CART_WITH_LOCKED_KEY, makeEmptyCart)

      return {
        previousSummary,
        previousActiveCart,
        previousCartWithLocked,
      }
    },

    onError(_error, _vars, context) {
      if (!context) return
      qc.setQueryData(SUMMARY_KEY, context.previousSummary)
      qc.setQueryData(CART_ACTIVE_KEY, context.previousActiveCart)
      qc.setQueryData(CART_WITH_LOCKED_KEY, context.previousCartWithLocked)
    },

    onSettled() {
      qc.invalidateQueries({ queryKey: SUMMARY_KEY })
      qc.invalidateQueries({ queryKey: CART_ACTIVE_KEY })
      qc.invalidateQueries({ queryKey: CART_WITH_LOCKED_KEY })
    },
  })
}
