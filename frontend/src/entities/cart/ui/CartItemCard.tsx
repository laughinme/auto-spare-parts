import { ImageIcon, LockIcon } from "lucide-react";
import { Cross2Icon, ReloadIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";

import type { CartItem } from "@/entities/cart/model/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

type CartItemCardProps = {
  item: CartItem;
  onRemove?: () => void;
  isRemoving?: boolean;
  actions?: ReactNode;
};

export function CartItemCard({ item, onRemove, isRemoving, actions }: CartItemCardProps) {
  const {
    product: { title, partNumber, make, media, allowCart },
  } = item;

  const imageUrl = media[0]?.url ?? null;
  const totalLabel = formatMoney(item.totalPrice);
  const unitLabel = formatMoney(item.unitPrice);
  const statusLabel = formatStatus(item.status);
  const isLocked = item.status === "locked" || !allowCart;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted sm:h-28 sm:w-28">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageIcon className="size-6" aria-hidden />
              <span className="text-[0.65rem] uppercase tracking-wide">
                Нет фото
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-tight text-foreground">
              {title}
            </h3>
            <Badge
              variant={isLocked ? "destructive" : "secondary"}
              className="flex items-center gap-1 capitalize"
            >
              {isLocked && <LockIcon className="size-3.5" aria-hidden />}
              {statusLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {partNumber && (
              <Badge variant="outline" className="uppercase tracking-wide">
                Арт. {partNumber}
              </Badge>
            )}
            {make && (
              <span className="leading-none">
                Производитель:{" "}
                <span className="font-medium text-foreground">
                  {make.name}
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              Количество:{" "}
              <span className="font-medium text-foreground">
                {item.quantity}
              </span>
            </span>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <span>
              Цена за штуку:{" "}
              <span className="font-medium text-foreground">
                {unitLabel}
              </span>
            </span>
          </div>

          {actions ? (
            <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </div>

        <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Итого
          </div>
          <div className="text-xl font-semibold text-foreground">
            {totalLabel}
          </div>
          <div className="text-xs text-muted-foreground">
            {unitLabel} × {item.quantity}
          </div>

          {onRemove && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 flex items-center gap-1 border-destructive/50 bg-destructive/10 text-xs text-destructive hover:bg-destructive/20"
              onClick={onRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <ReloadIcon className="size-3.5 animate-spin" aria-hidden />
                  Удаляем…
                </>
              ) : (
                <>
                  <Cross2Icon className="size-3.5" aria-hidden />
                  Удалить
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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

const formatStatus = (status: string) => {
  if (!status) {
    return "неизвестно";
  }

  if (status === "locked") {
    return "недоступен";
  }

  if (status === "active") {
    return "в наличии";
  }

  return status.replace(/_/g, " ");
};
