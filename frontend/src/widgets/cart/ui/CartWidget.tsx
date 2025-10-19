import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Loader2,
  Package2,
  ShoppingCart,
} from "lucide-react";

import { ROUTE_PATHS, buildProductDetailsPath } from "@/app/routes";
import { useCartQuery } from "@/entities/cart/model/useCartQuery";
import { CartItemCard } from "@/entities/cart/ui/CartItemCard";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

const SKELETON_COUNT = 3;

export function CartWidget() {
  const [showLocked, setShowLocked] = useState(false);
  const {
    data: cart,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCartQuery({ includeLocked: showLocked });

  const hasLockedItems =
    cart?.items.some((item) => item.status === "locked" || !item.product.allowCart) ??
    false;

  const totalLabel = cart ? formatMoney(cart.totalAmount) : "—";
  const uniqueItems = cart?.uniqueItems ?? 0;
  const totalItems = cart?.totalItems ?? 0;

  const content = useMemo(() => {
    if (isLoading && !cart) {
      return (
        <div className="space-y-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
                <Skeleton className="h-24 w-24 rounded-md sm:h-28 sm:w-28" />
                <div className="flex flex-1 flex-col gap-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertTriangle className="size-10 text-destructive" aria-hidden />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Не удалось загрузить корзину
              </h3>
              <p className="text-sm text-muted-foreground">
                Проверьте подключение к сети и попробуйте ещё раз.
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              Повторить попытку
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!cart || cart.items.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Package2 className="size-12 text-muted-foreground" aria-hidden />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Ваша корзина пуста
              </h3>
              <p className="text-sm text-muted-foreground">
                Добавьте запчасти из каталога или подборки.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link to={ROUTE_PATHS.buyer.fyp}>
                Перейти к каталогу
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {cart.items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            actions={
              <Button asChild size="sm" variant="outline">
                <Link to={buildProductDetailsPath(item.product.id)}>
                  Подробнее
                </Link>
              </Button>
            }
          />
        ))}
      </div>
    );
  }, [cart, isError, isLoading, refetch]);

  const checkoutDisabled =
    isLoading || !cart || cart.items.length === 0 || hasLockedItems;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="size-5 text-muted-foreground" aria-hidden />
              Корзина
            </CardTitle>
            <CardDescription>
              Управляйте составом заказа и контролируйте доступность позиций.
            </CardDescription>
          </div>
          <CardAction>
            <Label
              htmlFor="cart-include-locked"
              className="cursor-pointer rounded-md border bg-background/80 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              <Checkbox
                id="cart-include-locked"
                checked={showLocked}
                onCheckedChange={(value) => setShowLocked(value === true)}
              />
              Показывать недоступные
            </Label>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCell
              label="Позиции"
              value={
                isLoading && !cart ? (
                  <Skeleton className="h-6 w-14" />
                ) : (
                  uniqueItems
                )
              }
            />
            <SummaryCell
              label="Всего товаров"
              value={
                isLoading && !cart ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  totalItems
                )
              }
            />
            <SummaryCell
              label="Сумма заказа"
              value={
                isLoading && !cart ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  totalLabel
                )
              }
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>
              {showLocked
                ? "Показываются все товары, включая заблокированные."
                : "Сейчас отображаются только доступные для покупки товары."}
            </span>
            {hasLockedItems && (
              <span className="text-destructive">
                Уберите недоступные позиции, чтобы оформить заказ.
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {checkoutDisabled
              ? "Заполните корзину доступными товарами, чтобы продолжить."
              : "Все товары доступны. Можно оформить заказ."}
          </div>
          <Button size="lg" disabled={checkoutDisabled}>
            {isFetching && (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            )}
            Оформить заказ
          </Button>
        </CardFooter>
      </Card>

      {content}
    </div>
  );
}

type SummaryCellProps = {
  label: string;
  value: ReactNode;
};

function SummaryCell({ label, value }: SummaryCellProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return Number(value).toLocaleString("ru-RU");
  }
};
