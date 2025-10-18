import { ImageIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card"
import type { Product } from "@/entities/product/model/types"
import { buildProductDetailsPath } from "@/app/routes"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Link
      to={buildProductDetailsPath(product.id)}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b bg-gradient-to-br from-muted/70 via-muted to-muted/60">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
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
        </div>
        <CardContent className="space-y-2 px-5 py-4">
          <h3 className="text-base font-semibold leading-tight tracking-tight line-clamp-2">
            {product.title}
          </h3>
        </CardContent>
        <CardFooter className="flex items-end justify-between border-t px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Цена
            </span>
            <span className="text-lg font-semibold leading-none">
              {priceLabel}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
