import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, RefreshCcw } from "lucide-react"

import { useAuth } from "@/app/providers/auth/useAuth"
import { useSupplierProductDetail } from "@/entities/supplierProducts/model/useSupplierProductDetail"
import { supplierProductToProductDetail } from "@/entities/supplierProducts/model/adapters"
import { ProductDetails } from "@/entities/product/ui/ProductDetail"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function SupplierProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const auth = useAuth()
  const orgId = auth?.user?.organization?.id ?? null

  if (!orgId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Доступ ограничен</h1>
          <p className="text-muted-foreground">
            Для просмотра товара необходимо завершить регистрацию поставщика.
          </p>
        </div>
        <Button type="button" variant="default" disabled>
          Пройти онбординг
        </Button>
      </div>
    )
  }

  if (!productId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-muted-foreground">
            Не найден идентификатор товара. Вернитесь назад и выберите товар ещё раз.
          </div>
        </div>
      </div>
    )
  }

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useSupplierProductDetail({
    orgId,
    productId,
  })

  const productDetail = useMemo(
    () => (data ? supplierProductToProductDetail(data) : null),
    [data],
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
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

        {isLoading && <SupplierProductDetailsSkeleton />}

        {!isLoading && (isError || !productDetail) && (
          <SupplierProductDetailError onRetry={refetch} />
        )}

        {!isLoading && !isError && productDetail && (
          <ProductDetails product={productDetail} showCartActions={false} />
        )}
      </div>
    </div>
  )
}

function SupplierProductDetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full" />
        </div>
        <div className="space-y-3 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3 rounded-xl border bg-card p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

type SupplierProductDetailErrorProps = {
  onRetry: () => void
}

function SupplierProductDetailError({
  onRetry,
}: SupplierProductDetailErrorProps) {
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
