import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Cart } from "@/entities/cart/model/types"
import { updateCart, type UpdateCart } from "@/shared/api/cart"
import type { CartSummaryModel } from "@/hooks/cart/useGetCartSummary"

const SUMMARY_KEY = ["cart-summary"] as const
const CART_ACTIVE_KEY = ["cart", false] as const
const CART_WITH_LOCKED_KEY = ["cart", true] as const

type CartUpdater = (cart: Cart | undefined) => Cart | undefined

export function useUpdateCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCart) => updateCart(payload),

    async onMutate(variables) {
      const { item_id, quantity } = variables

      await Promise.all([
        qc.cancelQueries({ queryKey: SUMMARY_KEY }),
        qc.cancelQueries({ queryKey: CART_ACTIVE_KEY }),
        qc.cancelQueries({ queryKey: CART_WITH_LOCKED_KEY }),
      ])

      const previousSummary = qc.getQueryData<CartSummaryModel>(SUMMARY_KEY)
      const previousActiveCart = qc.getQueryData<Cart>(CART_ACTIVE_KEY)
      const previousCartWithLocked = qc.getQueryData<Cart>(CART_WITH_LOCKED_KEY)

      const targetItem =
        previousActiveCart?.items.find((item) => item.id === item_id) ??
        previousCartWithLocked?.items.find((item) => item.id === item_id)

      if (targetItem) {
        const deltaQuantity = quantity - targetItem.quantity
        const deltaAmount = targetItem.unitPrice * deltaQuantity

        qc.setQueryData<CartSummaryModel | undefined>(SUMMARY_KEY, (summary) =>
          summary
            ? {
                ...summary,
                totalItems: Math.max(summary.totalItems + deltaQuantity, 0),
                totalAmount: Math.max(summary.totalAmount + deltaAmount, 0),
              }
            : summary
        )
      }

      const applyUpdate: CartUpdater = (cart) => {
        if (!cart) return cart
        const index = cart.items.findIndex((item) => item.id === item_id)
        if (index === -1) return cart

        const currentItem = cart.items[index]
        let nextItems: typeof cart.items
        let nextTotalItems: number
        let nextTotalAmount: number

        if (quantity <= 0) {
          nextItems = cart.items.filter((item) => item.id !== item_id)
          nextTotalItems = cart.totalItems - currentItem.quantity
          nextTotalAmount = cart.totalAmount - currentItem.totalPrice
        } else {
          const updatedItem = {
            ...currentItem,
            quantity,
            totalPrice: currentItem.unitPrice * quantity,
          }
          nextItems = [...cart.items]
          nextItems[index] = updatedItem
          nextTotalItems = cart.totalItems - currentItem.quantity + quantity
          nextTotalAmount = cart.totalAmount - currentItem.totalPrice + updatedItem.totalPrice
        }

        return {
          ...cart,
          items: nextItems,
          uniqueItems: nextItems.length,
          totalItems: Math.max(nextTotalItems, 0),
          totalAmount: Math.max(nextTotalAmount, 0),
        }
      }

      qc.setQueryData<Cart | undefined>(CART_ACTIVE_KEY, applyUpdate)
      qc.setQueryData<Cart | undefined>(CART_WITH_LOCKED_KEY, applyUpdate)

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
