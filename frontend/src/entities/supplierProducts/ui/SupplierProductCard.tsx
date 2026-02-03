import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { SupplierProduct } from "../model/types";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type SupplierProductCardProps = {
  product: SupplierProduct;
  actions?: ReactNode;
  className?: string;
  disabled?: boolean;
  to?: string | null;
};

const statusVariant: Record<
  SupplierProduct["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  published: "default",
  archived: "secondary",
};

const statusLabel: Record<SupplierProduct["status"], string> = {
  draft: "Черновик",
  published: "Опубликован",
  archived: "Архив",
};

const conditionLabel: Record<SupplierProduct["condition"], string> = {
  new: "Новый",
  used: "Б/у",
};

export function SupplierProductCard({
  product,
  actions,
  className,
  disabled = false,
  to = null,
}: SupplierProductCardProps) {
  const cover = product.media[0];

  const priceLabel = formatPrice(product.price);
  const quantityLabel = Number.isFinite(product.quantityOnHand)
    ? product.quantityOnHand
    : "—";
  const body = (
    <article className={cn("flex h-full flex-col", className)}>
      <CardHeader className="space-y-1 border-b p-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/60">
          {cover ? (
            <img
              src={cover.url}
              alt={cover.alt ?? product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-8" aria-hidden />
              <span className="sr-only">Нет изображения</span>
            </div>
          )}
          <Badge
            variant={statusVariant[product.status] ?? "secondary"}
            className="absolute left-2 top-2 px-2 py-0.5 text-[10px] uppercase"
          >
            {statusLabel[product.status] ?? product.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-2 text-[15px] font-semibold leading-tight">
            {product.title}
          </CardTitle>
          <div className="shrink-0 text-right">
            <span className="text-sm font-semibold leading-none">
              {priceLabel}
            </span>
            <div className="text-[11px] text-muted-foreground">
              Остаток:&nbsp;
              <span className="font-semibold text-foreground">
                {quantityLabel}
              </span>
            </div>
          </div>
        </div>

        {product.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {product.description}
          </p>
        ) : (
          <span className="text-xs text-muted-foreground">
            Описание отсутствует
          </span>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Бренд:</span>
            <span className="font-medium text-foreground">{product.make.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Артикул:</span>
            <span className="font-medium text-foreground">
              {product.partNumber}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Состояние:</span>
            <span className="capitalize text-foreground">
              {conditionLabel[product.condition] ?? product.condition}
            </span>
          </div>
        </div>
      </CardContent>
      {!to && actions ? (
        <CardFooter className="border-t px-4 py-3">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            {actions}
          </div>
        </CardFooter>
      ) : null}
    </article>
  );

  return (
    <Card
      className={cn(
        "h-full overflow-hidden transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        { "pointer-events-none opacity-60": disabled },
      )}
    >
      {to ? (
        <>
          <Link to={to} className="block h-full">
            {body}
          </Link>
          {actions ? (
            <CardFooter className="border-t px-4 py-3">
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                {actions}
              </div>
            </CardFooter>
          ) : null}
        </>
      ) : (
        body
      )}
    </Card>
  );
}

function formatPrice(value: number) {
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
    return Number(value).toLocaleString();
  }
}
