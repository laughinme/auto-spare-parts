import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Cart } from "@/entities/cart/model/types"
import { removeCartItem } from "@/entities/cart/api"
import type { CartSummaryModel } from "./useGetCartSummary"

const SUMMARY_KEY = ["cart-summary"] as const
const CART_ACTIVE_KEY = ["cart", false] as const
const CART_WITH_LOCKED_KEY = ["cart", true] as const

type CartUpdater = (cart: Cart | undefined) => Cart | undefined

export function useRemoveCartItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),

    async onMutate(itemId) {
      await Promise.all([
        qc.cancelQueries({ queryKey: SUMMARY_KEY }),
        qc.cancelQueries({ queryKey: CART_ACTIVE_KEY }),
        qc.cancelQueries({ queryKey: CART_WITH_LOCKED_KEY }),
      ])

      const previousSummary = qc.getQueryData<CartSummaryModel>(SUMMARY_KEY)
      const previousActiveCart = qc.getQueryData<Cart>(CART_ACTIVE_KEY)
      const previousCartWithLocked = qc.getQueryData<Cart>(CART_WITH_LOCKED_KEY)

      const targetItem =
        previousActiveCart?.items.find((item) => item.id === itemId) ??
        previousCartWithLocked?.items.find((item) => item.id === itemId)

      const removedQuantity = targetItem?.quantity ?? 0
      const removedAmount = targetItem?.totalPrice ?? 0

      const applyRemoval: CartUpdater = (cart) => {
        if (!cart) return cart

        const index = cart.items.findIndex((item) => item.id === itemId)
        if (index === -1) {
          return cart
        }

        const nextItems = cart.items.filter((item) => item.id !== itemId)
        const nextTotalItems = Math.max(cart.totalItems - (cart.items[index]?.quantity ?? 0), 0)
        const nextTotalAmount = Math.max(cart.totalAmount - (cart.items[index]?.totalPrice ?? 0), 0)

        return {
          ...cart,
          items: nextItems,
          uniqueItems: nextItems.length,
          totalItems: nextTotalItems,
          totalAmount: nextTotalAmount,
        }
      }

      qc.setQueryData<CartSummaryModel | undefined>(SUMMARY_KEY, (data) =>
        data && removedQuantity > 0
          ? {
              ...data,
              totalItems: Math.max(data.totalItems - removedQuantity, 0),
              totalAmount: Math.max(data.totalAmount - removedAmount, 0),
            }
          : data
      )

      qc.setQueryData<Cart | undefined>(CART_ACTIVE_KEY, applyRemoval)
      qc.setQueryData<Cart | undefined>(CART_WITH_LOCKED_KEY, applyRemoval)

      return {
        previousSummary,
        previousActiveCart,
        previousCartWithLocked,
      }
    },

    onError(_error, _vars, context) {
      if (!context) {
        return
      }

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
