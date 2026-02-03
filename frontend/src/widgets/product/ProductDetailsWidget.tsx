import type { ProductDetail } from "@/entities/product/model/types"
import { ProductDetails } from "@/entities/product/ui/ProductDetail"
import { useAddToCart } from "@/features/cart/useAddToCart"
import { useUpdateCart } from "@/features/cart/useUpdateCart"
import { useRemoveCartItem } from "@/features/cart/useRemoveCartItem"
import { useCartQuery } from "@/entities/cart/model/useCartQuery"

type ProductDetailsWidgetProps = {
  product: ProductDetail
}

export function ProductDetailsWidget({ product }: ProductDetailsWidgetProps) {
  const { data: cart } = useCartQuery()
  const addMutation = useAddToCart()
  const updateMutation = useUpdateCart()
  const removeMutation = useRemoveCartItem()

  const cartItem = cart?.items.find((item) => item.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  const isAddPending =
    addMutation.isPending &&
    addMutation.variables?.product_id === product.id
  const isUpdatePending =
    updateMutation.isPending &&
    updateMutation.variables?.item_id === cartItem?.id
  const isRemovePending =
    removeMutation.isPending && removeMutation.variables === cartItem?.id

  const handleAddToCart = () => {
    if (cartItem) {
      updateMutation.mutate({
        item_id: cartItem.id,
        quantity: cartItem.quantity + 1,
      })
      return
    }
    addMutation.mutate({
      product_id: product.id,
      quantity: 1,
    })
  }

  const handleIncrement = () => {
    if (!cartItem) {
      addMutation.mutate({
        product_id: product.id,
        quantity: 1,
      })
      return
    }
    updateMutation.mutate({
      item_id: cartItem.id,
      quantity: cartItem.quantity + 1,
    })
  }

  const handleDecrement = () => {
    if (!cartItem) {
      return
    }
    if (cartItem.quantity <= 1) {
      removeMutation.mutate(cartItem.id)
      return
    }
    updateMutation.mutate({
      item_id: cartItem.id,
      quantity: cartItem.quantity - 1,
    })
  }

  return (
    <ProductDetails
      product={product}
      onAddToCart={handleAddToCart}
      isAddToCartLoading={isAddPending}
      cartQuantity={quantity}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      isCartUpdating={isUpdatePending || isRemovePending}
    />
  )
}
