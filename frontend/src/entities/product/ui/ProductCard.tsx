import { ImageIcon, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

import { buildProductDetailsPath } from "@/app/routes"
import type { Product } from "@/entities/product/model/types"
import { useAddToCart } from "@/hooks/useAddToCart"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { mutate: addToCart, isPending } = useAddToCart()

  const priceLabel = (() => {
    if (!Number.isFinite(product.price)) {
      return "—"
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: product.currency ?? "USD",
        maximumFractionDigits: 0,
      }).format(product.price)
    } catch {
      return Number(product.price).toLocaleString()
    }
  })()

  const conditionLabel = product.condition
    ? product.condition.replace(/_/g, " ")
    : null

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      quantity: 1,
    })
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      <Link
        to={buildProductDetailsPath(product.id)}
        className="relative block aspect-[4/3] w-full overflow-hidden border-b bg-gradient-to-br from-muted/70 via-muted to-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10" aria-hidden />
            <span className="sr-only">Нет изображения</span>
          </div>
        )}

        {conditionLabel && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 text-[0.65rem] font-semibold uppercase tracking-wide shadow-sm backdrop-blur"
          >
            {conditionLabel}
          </Badge>
        )}
      </Link>
      <CardContent className="space-y-2 px-5 py-4">
        <Link
          to={buildProductDetailsPath(product.id)}
          className="block text-base font-semibold leading-tight tracking-tight line-clamp-2 text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:underline"
        >
          {product.title}
        </Link>
      </CardContent>
      <CardFooter className="flex items-end justify-between gap-3 border-t px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Цена
          </span>
          <span className="text-lg font-semibold leading-none">
            {priceLabel}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0"
          onClick={handleAddToCart}
          disabled={isPending}
        >
          {isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          )}
          В корзину
        </Button>
      </CardFooter>
    </Card>
  )
}
