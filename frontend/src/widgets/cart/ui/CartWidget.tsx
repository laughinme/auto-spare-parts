import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2, Package2, ShoppingCart } from "lucide-react";
import { ReloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import { ROUTE_PATHS, buildProductDetailsPath } from "@/app/routes";
import { useCartQuery } from "@/entities/cart/model/useCartQuery";
import { CartItemCard } from "@/entities/cart/ui/CartItemCard";
import type { Cart } from "@/entities/cart/model/types";
import { useRemoveCartItem } from "@/features/cart/useRemoveCartItem";
import { useClearCart } from "@/features/cart/useClearCart";
import type { CartSummaryModel } from "@/features/cart/useGetCartSummary";
import { useStripeHostedCheckout } from "@/features/orders/useStripeHostedCheckout";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const SKELETON_COUNT = 3;
const MIN_SHIPPING_ADDRESS_LENGTH = 5;

export function CartWidget() {
  const queryClient = useQueryClient();
  const [showLocked, setShowLocked] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isCheckoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const {
    data: cart,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCartQuery({ includeLocked: showLocked });
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();
  const checkoutMutation = useStripeHostedCheckout();

  const cartItems = cart?.items ?? [];

  const checkoutReadyItems = useMemo(
    () =>
      cartItems.filter(
        (item) => item.status === "active" && item.product.allowCart,
      ),
    [cartItems],
  );

  const visibleItems = useMemo(
    () => (showLocked ? cartItems : checkoutReadyItems),
    [cartItems, checkoutReadyItems, showLocked],
  );

  const hasLockedItems = cartItems.length > checkoutReadyItems.length;

  const visibleTotals = useMemo(
    () => ({
      totalItems: visibleItems.reduce((total, item) => total + item.quantity, 0),
      totalAmount: visibleItems.reduce(
        (total, item) => total + item.totalPrice,
        0,
      ),
    }),
    [visibleItems],
  );

  const totalLabel =
    visibleItems.length > 0 ? formatMoney(visibleTotals.totalAmount) : "—";
  const totalItems = visibleTotals.totalItems;

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

    if (!cart || visibleItems.length === 0) {
      const hiddenItemsHint =
        hasLockedItems && !showLocked && cartItems.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Недавно оплаченные или заблокированные позиции скрыты из корзины. Включите{" "}
            <span className="font-semibold">«Показывать недоступные»</span>, чтобы увидеть их.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Добавьте запчасти из каталога или подборки.
          </p>
        );

      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Package2 className="size-12 text-muted-foreground" aria-hidden />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                Ваша корзина пуста
              </h3>
              {hiddenItemsHint}
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
        {visibleItems.map((item) => {
          const isRemoving =
            removeMutation.isPending && removeMutation.variables === item.id;

          return (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={() => removeMutation.mutate(item.id)}
              isRemoving={isRemoving}
              actions={
                <Button asChild size="sm" variant="outline">
                  <Link to={buildProductDetailsPath(item.product.id)}>
                    Подробнее
                  </Link>
                </Button>
              }
            />
          );
        })}
      </div>
    );
  }, [
    cart,
    cartItems.length,
    hasLockedItems,
    isError,
    isLoading,
    refetch,
    removeMutation,
    showLocked,
    visibleItems,
  ]);

  const normalizedShippingAddress = shippingAddress.trim();
  const isShippingAddressTooShort =
    normalizedShippingAddress.length < MIN_SHIPPING_ADDRESS_LENGTH;
  const hasCheckoutItems = checkoutReadyItems.length > 0;

  const checkoutDisabled = isLoading || !hasCheckoutItems;

  const handleCheckout = () => {
    if (!cart || checkoutMutation.isPending) {
      return;
    }

    if (isShippingAddressTooShort) {
      toast.error("Укажите полный адрес доставки");
      return;
    }

    if (!hasCheckoutItems) {
      toast.error("Нет доступных товаров для оформления заказа.");
      return;
    }

    const payload = {
      cart_item_ids: Array.from(
        new Set(
          checkoutReadyItems.map((item) => item.id),
        ),
      ),
      shipping_address: normalizedShippingAddress,
      notes: orderNotes.trim() ? orderNotes.trim() : undefined,
    };

    checkoutMutation.mutate(payload, {
      onSuccess: ({ url }) => {
        const makeEmptyCart = (cart: Cart | undefined): Cart | undefined =>
          cart
            ? {
                ...cart,
                items: [],
                uniqueItems: 0,
                totalItems: 0,
                totalAmount: 0,
              }
            : cart;

        queryClient.setQueryData<Cart | undefined>(["cart", false], makeEmptyCart);
        queryClient.setQueryData<Cart | undefined>(["cart", true], makeEmptyCart);
        queryClient.setQueryData<CartSummaryModel | undefined>(
          ["cart-summary"],
          (summary) =>
            summary
              ? {
                  ...summary,
                  totalItems: 0,
                  totalAmount: 0,
                }
              : summary,
        );

        queryClient.invalidateQueries({ queryKey: ["cart", false] }).catch(() => null);
        queryClient.invalidateQueries({ queryKey: ["cart", true] }).catch(() => null);
        queryClient.invalidateQueries({ queryKey: ["cart-summary"] }).catch(() => null);

        setCheckoutDialogOpen(false);

        toast.success("Перенаправляем на страницу оплаты…");
        window.location.assign(url);
      },
    });
  };

  const handleOpenCheckoutDialog = () => {
    if (!hasCheckoutItems || checkoutMutation.isPending) {
      return;
    }
    setCheckoutDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-0 py-0">
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto pr-2 text-sm text-muted-foreground whitespace-nowrap">
              <ShoppingCart className="size-4 shrink-0" aria-hidden />

              <span>Товаров:</span>
              {isLoading && !cart ? (
                <Skeleton className="h-5 w-10 shrink-0" />
              ) : (
                <span className="font-semibold tabular-nums text-foreground">
                  {totalItems}
                </span>
              )}

              <span className="text-muted-foreground/60">•</span>

              <span>Сумма:</span>
              {isLoading && !cart ? (
                <Skeleton className="h-5 w-24 shrink-0" />
              ) : (
                <span className="font-semibold tabular-nums text-foreground">
                  {totalLabel}
                </span>
              )}

              <span className="text-muted-foreground/60">•</span>

              <Label
                htmlFor="cart-include-locked"
                className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground"
              >
                <Checkbox
                  id="cart-include-locked"
                  checked={showLocked}
                  onCheckedChange={(value) => setShowLocked(value === true)}
                />
                Недоступные
              </Label>
            </div>

            <Button
              type="button"
              size="sm"
              className="shrink-0"
              disabled={checkoutDisabled || checkoutMutation.isPending}
              onClick={handleOpenCheckoutDialog}
            >
              {(checkoutMutation.isPending || isFetching) && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              )}
              {checkoutMutation.isPending ? "Обработка…" : "Оформить заказ"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {content}

      {cartItems.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || !cart || cart.items.length === 0}
          >
            {clearMutation.isPending ? (
              <>
                <ReloadIcon className="size-3.5 animate-spin" aria-hidden />
                Очистка…
              </>
            ) : (
              <>
                <TrashIcon className="size-3.5" aria-hidden />
                Очистить корзину
              </>
            )}
          </Button>
        </div>
      )}

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Укажите адрес доставки</DialogTitle>
            <DialogDescription>
              После сохранения мы перенаправим вас на защищённую страницу оплаты Stripe.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleCheckout();
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="dialog-shipping-address" className="font-medium">
                  Адрес доставки
                </Label>
                <span className="text-xs uppercase text-muted-foreground">
                  обязательно
                </span>
              </div>
              <Textarea
                id="dialog-shipping-address"
                placeholder="Город, улица, дом, контактный телефон"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                aria-invalid={isShippingAddressTooShort}
              />
              <p className="text-xs text-muted-foreground">
                Укажите полный адрес, чтобы продавец смог оформить доставку.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-order-notes" className="text-sm font-medium">
                Комментарий к заказу
              </Label>
              <Textarea
                id="dialog-order-notes"
                placeholder="Например: подъезд, желаемое время доставки, контакты"
                value={orderNotes}
                onChange={(event) => setOrderNotes(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Опционально. Передадим сообщение продавцу вместе с заказом.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCheckoutDialogOpen(false)}
                disabled={checkoutMutation.isPending}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Создание платежа…
                  </>
                ) : (
                  "Оплатить"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Number(value).toLocaleString("en-US")}`;
  }
};
