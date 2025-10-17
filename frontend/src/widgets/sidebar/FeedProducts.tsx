import { useEffect, useMemo, useRef } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { toProductFeed } from "@/entities/product/model/adapters"
import { ProductCard } from "@/entities/product/ui/ProductCard"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { getProductsFeed } from "@/shared/api/products"

const PAGE_SIZE = 12
const INITIAL_SKELETON_ITEMS = 8
const LOADING_MORE_SKELETON_ITEMS = 3

export function FeedProducts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products", "feed"],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await getProductsFeed({
        limit: PAGE_SIZE,
        cursor: pageParam,
      })

      return toProductFeed(response)
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  )

  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasNextPage) {
      return
    }

    const target = loaderRef.current
    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: "240px" }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const isInitialLoading = isLoading && products.length === 0
  const isEmpty = !isLoading && products.length === 0 && !isError

  const skeletonCount = isInitialLoading
    ? INITIAL_SKELETON_ITEMS
    : isFetchingNextPage
      ? LOADING_MORE_SKELETON_ITEMS
      : 0

  return (
    <div className="flex flex-col gap-6">
      {isError && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <span className="leading-snug">
            Не удалось загрузить подборку товаров. Попробуйте ещё раз.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Обновить
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={`product-skeleton-${index}`} />
        ))}
      </div>

      {isEmpty && (
        <div className="rounded-xl border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Пока нет товаров для отображения.
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Загрузка..." : "Показать ещё"}
          </Button>
        </div>
      )}

      <div ref={loaderRef} aria-hidden className="h-px w-full" />
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardContent className="space-y-3 px-5 py-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="border-t px-5 py-4">
        <Skeleton className="h-6 w-24" />
      </CardFooter>
    </Card>
  )
}
