import { useMemo, useState } from "react";

import { SupplierProductCard } from "@/entities/supllierProducts/ui/SupplierProductCard";
import { useSupplierProducts } from "@/entities/supllierProducts/model/useSupplierProducts";
import type { OrgProductStatus } from "@/shared/api/org-products";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";

type SupplierProductsWidgetProps = {
  orgId: string;
  limit?: number;
};

const STATUS_OPTIONS: Array<{ value: OrgProductStatus | "all"; label: string }> =
  [
    { value: "all", label: "Все" },
    { value: "published", label: "Опубликованы" },
    { value: "draft", label: "Черновики" },
    { value: "archived", label: "Архив" },
  ];

export function SupplierProductsWidget({
  orgId,
  limit = 20,
}: SupplierProductsWidgetProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrgProductStatus | "all">(
    "all",
  );

  const trimmedSearch = search.trim();
  const statusParam =
    statusFilter === "all" ? undefined : (statusFilter as OrgProductStatus);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSupplierProducts({
    orgId,
    limit,
    q: trimmedSearch === "" ? null : trimmedSearch,
    status: statusParam,
  });

  const products = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const showSkeletons = isLoading && products.length === 0;
  const isEmpty = !isLoading && !isFetching && products.length === 0 && !isError;

  const titleSuffix = useMemo(() => {
    if (isLoading && !data) {
      return "· загрузка…";
    }
    if (totalCount > 0) {
      return `· ${totalCount}`;
    }
    return "";
  }, [data, isLoading, totalCount]);

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader className="gap-4 border-b bg-muted/30 py-4 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold sm:text-xl">
              Мои товары {titleSuffix && <span className="text-muted-foreground">{titleSuffix}</span>}
            </CardTitle>
            <CardDescription>
              Следите за статусом и запасами ваших позиций.
            </CardDescription>
          </div>
          <Button type="button" variant="secondary" size="sm" disabled>
            Добавить товар
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по названию или артикулу"
              className="w-full"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as OrgProductStatus | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 py-6">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Не удалось загрузить товары
              </p>
              <p className="text-sm text-muted-foreground">
                Проверьте соединение с интернетом и попробуйте снова.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Повторить попытку
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            <p className="text-base font-medium text-foreground">
              Пока нет товаров
            </p>
            <p className="text-sm max-w-md">
              Создайте первую позицию, чтобы начать продажи и отслеживать её статус прямо здесь.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {showSkeletons
              ? Array.from({ length: Math.max(3, Math.min(6, limit)) }).map(
                  (_value, index) => (
                    <SupplierProductCardSkeleton key={`supplier-card-skeleton-${index}`} />
                  ),
                )
              : products.map((product) => (
                  <SupplierProductCard key={product.id} product={product} />
                ))}
          </div>
        )}
        {isFetching && !isLoading && (
          <p className="text-center text-xs text-muted-foreground">
            Обновляем данные…
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SupplierProductCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
