import { useCallback } from "react"

import type { ProductDetail } from "@/entities/product/model/types"
import { ProductDetails } from "@/entities/product/ui/ProductDetail"
import { useAddToCart } from "@/hooks/useAddToCart"

type ProductDetailsWidgetProps = {
  product: ProductDetail
}

export function ProductDetailsWidget({ product }: ProductDetailsWidgetProps) {
  const { mutate: addToCart, isPending } = useAddToCart()

  const handleAddToCart = useCallback(() => {
    addToCart({
      product_id: product.id,
      quantity: 1,
    })
  }, [addToCart, product.id])

  return (
    <ProductDetails
      product={product}
      onAddToCart={handleAddToCart}
      isAddToCartLoading={isPending}
    />
  )
}
