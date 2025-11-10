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
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {cover ? (
            <img
              src={cover.url}
              alt={cover.alt ?? product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-10" aria-hidden />
              <span className="sr-only">Нет изображения</span>
            </div>
          )}
          <Badge
            variant={statusVariant[product.status] ?? "secondary"}
            className="absolute left-3 top-3 uppercase"
          >
            {statusLabel[product.status] ?? product.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-5 py-4">
        <CardTitle className="line-clamp-2 text-base font-semibold leading-tight">
          {product.title}
        </CardTitle>
        <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Бренд:</dt>
          <dd className="font-medium text-foreground">{product.make.name}</dd>
          <dt className="text-muted-foreground">Артикул:</dt>
          <dd className="font-medium text-foreground">
            {product.partNumber}
          </dd>
          <dt className="text-muted-foreground">Состояние:</dt>
          <dd className="capitalize text-foreground">
            {conditionLabel[product.condition] ?? product.condition}
          </dd>
        </dl>
        {product.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Цена
          </span>
          <span className="text-lg font-semibold leading-none">
            {priceLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            Остаток:&nbsp;
            <span className="font-semibold text-foreground">
              {quantityLabel}
            </span>
          </span>
        </div>
        {!to && actions ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {actions}
          </div>
        ) : null}
      </CardFooter>
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
            <CardFooter className="border-t px-5 py-4">
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
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
