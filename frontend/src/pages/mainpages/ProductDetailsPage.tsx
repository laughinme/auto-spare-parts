import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, RefreshCcw } from "lucide-react"

import { toProductDetails } from "@/entities/product/model/adapters"
import { getProductDetails } from "@/shared/api/products"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ProductDetailsWidget } from "@/widgets/product/ProductDetailsWidget"

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductDetails(productId as string),
    select: toProductDetails,
    enabled: Boolean(productId),
    staleTime: 30_000,
  })

  if (!productId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-muted-foreground">
            Не найден идентификатор товара. Вернитесь назад и выберите товар ещё раз.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate(-1)}
            disabled={isLoading || isFetching}
          >
            <ArrowLeft className="size-4" />
            Назад
          </Button>
        </div>

        {isLoading && <ProductDetailsSkeleton />}

        {!isLoading && (isError || !data) && (
          <ErrorState
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && data && (
          <ProductDetailsWidget product={data} />
        )}
      </div>
    </div>
  )
}

function ProductDetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

type ErrorStateProps = {
  onRetry: () => void
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
      <div className="space-y-1">
        <p className="font-semibold">Не удалось загрузить детали товара</p>
        <p className="text-muted-foreground">
          Проверьте соединение с сетью и попробуйте выполнить запрос ещё раз.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => onRetry()}
      >
        <RefreshCcw className="size-4" />
        Повторить
      </Button>
    </div>
  )
}
