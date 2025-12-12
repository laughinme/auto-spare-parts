import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useOutletContext } from "react-router-dom"
import { Search, SlidersHorizontal } from "lucide-react"

import type { ProtectedOutletContext } from "@/app/App"
import { toProductFeed } from "@/entities/product/model/adapters"
import { ProductCard } from "@/entities/product/ui/ProductCard"
import { useCartQuery } from "@/entities/cart/model/useCartQuery"
import { useAddToCart } from "@/features/cart/useAddToCart"
import { useUpdateCart } from "@/features/cart/useUpdateCart"
import { useRemoveCartItem } from "@/features/cart/useRemoveCartItem"
import { ProductFiltersForm } from "@/features/product-filters/ui/ProductFiltersForm"
import type { FilterState } from "@/features/product-filters/model/types"
import { buildParams } from "@/features/product-filters/model/buildParams"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { getProductsCatalog } from "@/entities/product/api"

const CATALOG_PAGE_SIZE = 20

const createDefaultFilters = (): FilterState => ({
  q: "",
  make_id: null,
  condition: null,
  originality: null,
  price_min: "",
  price_max: "",
})

export function FeedProducts() {
  const { setHeaderSearch } = useOutletContext<ProtectedOutletContext>()

  const [draftFilters, setDraftFilters] = useState<FilterState>(createDefaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(createDefaultFilters)
  const [areFiltersVisible, setFiltersVisible] = useState(true)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: cart } = useCartQuery()
  const addMutation = useAddToCart()
  const updateMutation = useUpdateCart()
  const removeMutation = useRemoveCartItem()

  const queryParams = useMemo(
    () => buildParams(appliedFilters),
    [appliedFilters]
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products", "catalog", queryParams],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await getProductsCatalog({
        ...queryParams,
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

  const currentPageSize = queryParams.limit ?? CATALOG_PAGE_SIZE
  const initialSkeletonCount = Math.max(4, Math.min(12, currentPageSize))
  const loadingMoreSkeletonCount = Math.max(2, Math.min(6, Math.ceil(currentPageSize / 4)))

  const loaderRef = useRef<HTMLDivElement | null>(null)

  const handleFiltersChange = useCallback((patch: Partial<FilterState>) => {
    setDraftFilters((prev) => {
      const nextDraft = {
        ...prev,
        ...patch,
      }

      if ("q" in patch) {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }
        searchDebounceRef.current = setTimeout(() => {
          setAppliedFilters((prevApplied) => {
            const nextApplied = {
              ...nextDraft,
            }
            const isSame =
              JSON.stringify(prevApplied ?? {}) === JSON.stringify(nextApplied ?? {})
            return isSame ? prevApplied : nextApplied
          })
        }, 350)
      }

      return nextDraft
    })
  }, [])

  const handleApply = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }
    setAppliedFilters((prev) => {
      const next = {
        ...draftFilters,
      }
      const isSame =
        JSON.stringify(prev ?? {}) === JSON.stringify(next ?? {})
      return isSame ? prev : next
    })
  }, [draftFilters])

  const handleReset = useCallback(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }
    const resetDraft = createDefaultFilters()
    const resetApplied = createDefaultFilters()
    setDraftFilters(resetDraft)
    setAppliedFilters(resetApplied)
  }, [])

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
    ? initialSkeletonCount
    : isFetchingNextPage
      ? loadingMoreSkeletonCount
      : 0

  const searchNode = useMemo(() => {
    const value = draftFilters.q ?? ""
    return (
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          handleApply()
        }}
      >
        <div className="relative flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(event) =>
              handleFiltersChange({ q: event.target.value })
            }
            placeholder="Поиск по каталогу"
            className="w-52 pl-9"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={isLoading}
        >
          Найти
        </Button>
      </form>
    )
  }, [draftFilters.q, handleApply, handleFiltersChange, isLoading])

  useEffect(() => {
    setHeaderSearch(searchNode)
  }, [searchNode, setHeaderSearch])

  useEffect(
    () => () => {
      setHeaderSearch(null)
    },
    [setHeaderSearch]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setFiltersVisible((prev) => !prev)}
          className="gap-2"
          aria-expanded={areFiltersVisible}
        >
          <SlidersHorizontal className="size-4" />
          {areFiltersVisible ? "Скрыть фильтры" : "Показать фильтры"}
        </Button>
      </div>

      {areFiltersVisible && (
        <ProductFiltersForm
          state={draftFilters}
          onChange={handleFiltersChange}
          onReset={handleReset}
          onApply={handleApply}
          disabled={isLoading || isFetchingNextPage}
          isLoading={isLoading || isFetchingNextPage}
        />
      )}

      {isError && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          <span className="leading-snug">
            Не удалось загрузить каталог товаров. Попробуйте ещё раз.
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
        {products.map((product) => {
          const cartItem = cart?.items.find(
            (item) => item.product.id === product.id
          )
          const quantity = cartItem?.quantity ?? 0
          const isAddPending =
            addMutation.isPending &&
            addMutation.variables?.product_id === product.id
          const isUpdatePending =
            updateMutation.isPending &&
            updateMutation.variables?.item_id === cartItem?.id
          const isRemovePending =
            removeMutation.isPending && removeMutation.variables === cartItem?.id
          const isMutating = isAddPending || isUpdatePending || isRemovePending

          return (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantity}
              onAddToCart={() =>
                addMutation.mutate({
                  product_id: product.id,
                  quantity: 1,
                })
              }
              onIncrement={() => {
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
              }}
              onDecrement={() => {
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
              }}
              isMutating={isMutating}
            />
          )
        })}

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
