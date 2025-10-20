import { ImageIcon, Loader2 } from "lucide-react"

import type { ProductDetail } from "@/entities/product/model/types"
import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"

type ProductDetailsProps = {
  product: ProductDetail
  onAddToCart?: () => void
  isAddToCartLoading?: boolean
}

export function ProductDetails({
  product,
  onAddToCart,
  isAddToCartLoading = false,
}: ProductDetailsProps) {
  const priceLabel = formatPrice(product.price, product.currency)
  const conditionLabel = formatCondition(product.condition)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="border-b-0 p-0">
            <div className="relative aspect-[4/3] w-full bg-muted">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-10" aria-hidden />
                  <span className="text-xs">Нет изображения</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Описание
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {product.description ? (
              <p className="whitespace-pre-line">{product.description}</p>
            ) : (
              <p className="italic text-muted-foreground/80">
                Описание пока не добавлено.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-3 pb-0">
            <div className="flex items-center gap-3">
              {conditionLabel && (
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {conditionLabel}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold leading-tight">
              {product.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Цена
              </span>
              <p className="text-3xl font-semibold">{priceLabel}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                onClick={onAddToCart}
                disabled={!onAddToCart || isAddToCartLoading}
              >
                {isAddToCartLoading && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                Добавить в корзину
              </Button>
              <Button variant="outline" className="flex-1">
                Оставить отзыв
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Характеристики
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <CharacteristicRow label="Состояние" value={conditionLabel ?? "—"} />
            <CharacteristicRow label="Валюта" value={product.currency?.toUpperCase() ?? "—"} />
            <CharacteristicRow label="Цена" value={priceLabel} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type CharacteristicRowProps = {
  label: string
  value: string
}

function CharacteristicRow({ label, value }: CharacteristicRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}

const formatPrice = (price: number, currency?: string) => {
  if (!Number.isFinite(price)) {
    return "—"
  }
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return Number(price).toLocaleString("ru-RU")
  }
}

const formatCondition = (condition: string) => {
  if (!condition) {
    return null
  }
  return condition.replace(/_/g, " ")
}
