import { useMutation, useQueryClient } from "@tanstack/react-query"

import { AddToCart, type AddCartItemBody } from "@/shared/api/cart"

export function useAddToCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddCartItemBody) => AddToCart(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] })
      qc.invalidateQueries({ queryKey: ["cart", true] })
    },
  })
}
