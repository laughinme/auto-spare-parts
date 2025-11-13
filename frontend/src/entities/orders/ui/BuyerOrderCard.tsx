import {
  BadgeCheck,
  ImageIcon,
  MapPin,
  PackageCheck,
  PackageMinus,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";

import type { BuyerOrder, BuyerOrderItem } from "@/entities/orders/model/types";
import type { OrderStatus } from "@/shared/api/orders";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

type BuyerOrderCardProps = {
  order: BuyerOrder;
};

const STATUS_META: Record<
  OrderStatus | "default",
  { label: string; className: string }
> = {
  pending: {
    label: "В ожидании",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  paid: {
    label: "Оплачен",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  refunded: {
    label: "Возврат",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  failed: {
    label: "Ошибка",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  cancelled: {
    label: "Отменён",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  expired: {
    label: "Просрочен",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  default: {
    label: "Неизвестно",
    className: "bg-muted text-muted-foreground border-transparent",
  },
};

export function BuyerOrderCard({ order }: BuyerOrderCardProps) {
  const paymentStatusMeta = getStatusMeta(order.paymentStatus);
  const createdAtLabel = formatDate(order.createdAt);
  const updatedAtLabel = order.updatedAt ? formatDate(order.updatedAt) : null;
  const shortId = order.id.slice(0, 8).toUpperCase();
  const totalLabel = formatMoney(order.totalAmount);

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div>
          <CardTitle className="text-lg">
            Заказ #{shortId}
          </CardTitle>
          <CardDescription className="flex gap-2 text-sm">
            <span>Создан {createdAtLabel}</span>
            {updatedAtLabel ? (
              <span className="text-muted-foreground">
                • Обновлён {updatedAtLabel}
              </span>
            ) : null}
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "h-fit w-fit capitalize",
            paymentStatusMeta.className,
          )}
        >
          {paymentStatusMeta.label}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 py-6">
        <div className="@container/order-summary grid gap-4 sm:grid-cols-3">
          <OrderSummaryItem
            icon={<PackageCheck className="size-4" aria-hidden />}
            label="Сумма заказа"
            value={totalLabel}
            helper={`${order.totalItems} товаров • ${order.uniqueItems} уник.`}
          />
          <OrderSummaryItem
            icon={<Truck className="size-4" aria-hidden />}
            label="Отправлено"
            value={`${order.shippedItems}/${order.totalItems}`}
            helper="фактически покинули склад"
          />
          <OrderSummaryItem
            icon={<BadgeCheck className="size-4" aria-hidden />}
            label="Доставлено"
            value={`${order.deliveredItems}/${order.totalItems}`}
            helper="получено покупателем"
          />
        </div>

        {(order.shippingAddress || order.notes) && (
          <div className="@container/order-details grid gap-4 sm:grid-cols-2">
            {order.shippingAddress ? (
              <OrderInfoPanel
                icon={<MapPin className="size-4" aria-hidden />}
                title="Адрес доставки"
                text={order.shippingAddress}
              />
            ) : null}
            {order.notes ? (
              <OrderInfoPanel
                icon={<PackageMinus className="size-4" aria-hidden />}
                title="Комментарий к заказу"
                text={order.notes}
              />
            ) : null}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Товары ({order.items.length})
            </p>
          </div>

          <div className="divide-y rounded-xl border">
            {order.items.map((item, index) => (
              <BuyerOrderItemRow key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const BuyerOrderItemRow = ({ item }: { item: BuyerOrderItem }) => {
  const product = item.product;
  const imageUrl = product?.media[0]?.url ?? null;
  const title = product?.title ?? item.productSnapshot.title;
  const description = product?.description ?? item.productSnapshot.description;
  const makeName = product?.make?.name ?? item.productSnapshot.makeName;
  const partNumber = product?.partNumber ?? item.productSnapshot.partNumber;
  const condition = product?.condition ?? item.productSnapshot.condition;
  const statusMeta = getStatusMeta(item.status);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:gap-6 sm:px-6">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted sm:h-20 sm:w-20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            <ImageIcon className="size-4" aria-hidden />
            Нет фото
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <Badge
            variant="outline"
            className={cn("capitalize", statusMeta.className)}
          >
            {statusMeta.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {makeName ? (
            <span>
              Бренд:{" "}
              <span className="font-medium text-foreground">
                {makeName}
              </span>
            </span>
          ) : null}
          {partNumber ? (
            <>
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              <span>Арт. {partNumber}</span>
            </>
          ) : null}
          {condition ? (
            <>
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              <span>Состояние: {translateCondition(condition)}</span>
            </>
          ) : null}
        </div>

        {description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Кол-во:{" "}
            <span className="font-medium text-foreground">{item.quantity}</span>
          </span>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <span>
            Цена:{" "}
            <span className="font-medium text-foreground">
              {formatMoney(item.unitPrice)}
            </span>
          </span>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <span>
            Итого:{" "}
            <span className="font-semibold text-foreground">
              {formatMoney(item.totalPrice)}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {item.sellerOrganization ? (
            <span>
              Продавец:{" "}
              <span className="text-foreground">
                {item.sellerOrganization.name}
              </span>
              {item.sellerOrganization.country
                ? ` • ${item.sellerOrganization.country}`
                : ""}
            </span>
          ) : null}
          {item.trackingNumber || item.trackingUrl ? (
            <span>
              Трек-номер:{" "}
              <span className="text-foreground">
                {item.trackingNumber ?? "—"}
              </span>
              {item.trackingUrl ? (
                <>
                  {" "}
                  ·{" "}
                  <a
                    href={item.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    отследить
                  </a>
                </>
              ) : null}
            </span>
          ) : null}
          {item.shippedAt ? (
            <span>Отгружено: {formatDate(item.shippedAt)}</span>
          ) : null}
          {item.deliveredAt ? (
            <span>Доставлено: {formatDate(item.deliveredAt)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const OrderSummaryItem = ({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
}) => (
  <div className="rounded-xl border bg-muted/30 p-4">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </div>
    <p className="text-lg font-semibold text-foreground">{value}</p>
    {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
  </div>
);

const OrderInfoPanel = ({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) => (
  <div className="rounded-xl border bg-card/60 p-4">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
      {icon}
      {title}
    </div>
    <p className="text-sm text-foreground">{text}</p>
  </div>
);

const formatDate = (value: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const formatMoney = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
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

const translateCondition = (condition: string | null) => {
  switch (condition) {
    case "new":
      return "новая";
    case "used":
      return "б/у";
    default:
      return condition ?? "—";
  }
};

const getStatusMeta = (status: OrderStatus | null | undefined) => {
  if (!status) {
    return STATUS_META.default;
  }
  return STATUS_META[status] ?? STATUS_META.default;
};
