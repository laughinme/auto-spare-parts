import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Filter,
  Inbox,
  Loader2,
  RefreshCcw,
  Repeat,
} from "lucide-react";

import {
  ORDER_SORTS,
  ORDER_STATUSES,
  type OrderSort,
  type OrderStatus,
} from "@/shared/api/orders";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useBuyerOrders } from "@/entities/orders/model/useBuyerOrders";
import { BuyerOrderCard } from "@/entities/orders/ui/BuyerOrderCard";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "В ожидании",
  paid: "Оплачен",
  refunded: "Возврат",
  failed: "Ошибка",
  cancelled: "Отменён",
  expired: "Просрочен",
};

const SORT_LABELS: Record<OrderSort, string> = {
  price_asc: "Цена ↑",
  price_desc: "Цена ↓",
  created_at_asc: "Сначала старые",
  created_at_desc: "Сначала новые",
};

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

export function BuyerOrdersWidget() {
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [orderBy, setOrderBy] = useState<OrderSort>("created_at_desc");
  const [limit, setLimit] = useState<number>(20);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([
    null,
  ]);

  const currentCursor = cursorHistory[cursorHistory.length - 1] ?? null;

  const {
    data,
    error,
    refetch,
    isPending,
    isError,
    isFetching,
  } = useBuyerOrders({
    statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    orderBy,
    limit,
    cursor: currentCursor,
  });

  const orders = data?.items ?? [];
  const hasNextPage = Boolean(data?.nextCursor);
  const isInitialLoading = isPending;
  const isLoadingNextPage = isPending && cursorHistory.length > 1;
  const hasFilters =
    selectedStatuses.length > 0 || orderBy !== "created_at_desc" || limit !== 20;
  const currentPage = cursorHistory.length;

  const statusChips = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        value: status,
        label: STATUS_LABELS[status],
        selected: selectedStatuses.includes(status),
      })),
    [selectedStatuses],
  );

  const handleToggleStatus = (status: OrderStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((item) => item !== status);
      }
      return [...prev, status];
    });
    resetPagination();
  };

  const handleResetStatuses = () => {
    if (selectedStatuses.length === 0) {
      return;
    }
    setSelectedStatuses([]);
    resetPagination();
  };

  const handleSortChange = (value: OrderSort) => {
    setOrderBy(value);
    resetPagination();
  };

  const handleLimitChange = (value: string) => {
    const numericValue = Number(value) || 20;
    setLimit(numericValue);
    resetPagination();
  };

  const handleNextPage = () => {
    if (!data?.nextCursor) {
      return;
    }
    setCursorHistory((prev) => [...prev, data.nextCursor]);
  };

  const handlePrevPage = () => {
    setCursorHistory((prev) =>
      prev.length > 1 ? prev.slice(0, prev.length - 1) : prev,
    );
  };

  const handleResetPaginationOnly = () => {
    resetPagination();
  };

  const resetPagination = () => {
    setCursorHistory([null]);
  };

  const handleResetAll = () => {
    if (!hasFilters && cursorHistory.length === 1) {
      return;
    }
    setSelectedStatuses([]);
    setOrderBy("created_at_desc");
    setLimit(20);
    resetPagination();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border bg-card/50 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="size-4" aria-hidden />
            Статусы
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            <Button
              variant={selectedStatuses.length === 0 ? "default" : "outline"}
              size="sm"
              onClick={handleResetStatuses}
              aria-pressed={selectedStatuses.length === 0}
            >
              Все
            </Button>
            {statusChips.map((status) => (
              <Button
                key={status.value}
                variant={status.selected ? "default" : "outline"}
                size="sm"
                className={cn(
                  "capitalize",
                  status.selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background",
                )}
                onClick={() => handleToggleStatus(status.value)}
                aria-pressed={status.selected}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={orderBy} onValueChange={(value) => handleSortChange(value as OrderSort)}>
              <SelectTrigger size="sm" className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_SORTS.map((sort) => (
                  <SelectItem key={sort} value={sort}>
                    {SORT_LABELS[sort]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger size="sm" className="w-32">
                <SelectValue placeholder="Лимит" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} шт.
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={handleResetPaginationOnly}
              disabled={cursorHistory.length <= 1}
            >
              <Repeat className="size-4" aria-hidden />
              Сначала
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={handleResetAll}
              disabled={!hasFilters && cursorHistory.length <= 1}
            >
              <RefreshCcw className="size-4" aria-hidden />
              Сбросить
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Стр. {currentPage}</span>
            <span>•</span>
            <span>{orders.length} заказов</span>
            {isFetching ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
            ) : null}
          </div>
        </div>
      </section>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : isInitialLoading ? (
        <OrdersLoadingState />
      ) : orders.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order, index) => (
            <BuyerOrderCard key={`${order.id}-${index}`} order={order} />
          ))}
        </div>
      )}

      {orders.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={cursorHistory.length <= 1 || isPending}
          >
            Назад
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={!hasNextPage || isPending || isLoadingNextPage}
          >
            {isLoadingNextPage ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Загружаем…
              </>
            ) : (
              "Следующая страница"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Показаны заказы {((currentPage - 1) * limit) + 1} -{" "}
            {((currentPage - 1) * limit) + orders.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}

const OrdersLoadingState = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="rounded-2xl border bg-card/40 p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
    <AlertTriangle className="size-10 text-destructive" aria-hidden />
    <p className="text-base font-semibold text-destructive">Не удалось загрузить заказы</p>
    <p className="text-sm text-destructive/80">{message}</p>
    <Button variant="outline" className="gap-2" onClick={onRetry}>
      <RefreshCcw className="size-4" aria-hidden />
      Повторить
    </Button>
  </div>
);

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/30 p-6 text-center text-muted-foreground">
    <Inbox className="size-10" aria-hidden />
    <p className="text-base font-semibold text-foreground">
      {hasFilters ? "Нет заказов по выбранным фильтрам" : "У вас пока нет заказов"}
    </p>
    <p className="text-sm">
      {hasFilters
        ? "Попробуйте изменить статус или сортировку."
        : "Как только вы оформите покупку, она появится здесь."}
    </p>
  </div>
);

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    if (message.trim().length > 0) {
      return message;
    }
  }
  return "Попробуйте обновить страницу или повторите попытку позже.";
};
