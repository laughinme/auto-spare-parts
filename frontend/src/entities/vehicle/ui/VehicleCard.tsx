import type { ReactNode } from "react";

import type { Vehicle } from "@/entities/vehicle/model/types";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

type VehicleCardProps = {
  vehicle: Vehicle;
  actions?: ReactNode;
  className?: string;
};

export function VehicleCard({ vehicle, actions, className }: VehicleCardProps) {
  const {
    make,
    model,
    year,
    vehicleType,
    vin,
    comment,
    createdAt,
    updatedAt,
  } = vehicle;

  const hasComment = Boolean(comment?.trim());
  const createdLabel = formatDate(createdAt);
  const updatedLabel = formatDate(updatedAt);

  return (
    <Card className={cn("h-full border-border/60", className)}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight">
            {make.makeName} {model.modelName}
          </CardTitle>
          <Badge variant="secondary" className="uppercase tracking-wide">
            {vehicleType.name}
          </Badge>
        </div>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <span className="font-medium text-foreground">
            {year || "—"}
          </span>
          <Separator orientation="vertical" className="hidden h-4 md:block" />
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            VIN: {vin || "—"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Производитель
            </dt>
            <dd className="text-base font-medium text-foreground">
              {make.makeName}
            </dd>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Модель
            </dt>
            <dd className="text-base font-medium text-foreground">
              {model.modelName}
            </dd>
          </div>
        </dl>

        {hasComment ? (
          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Комментарий
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {comment}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-xs uppercase tracking-wide text-muted-foreground">
            Комментарий не указан
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>
            Создан:{" "}
            <span className="font-medium text-foreground">
              {createdLabel ?? "—"}
            </span>
          </span>
          <Separator orientation="vertical" className="hidden h-4 md:block" />
          <span>
            Обновлён:{" "}
            <span className="font-medium text-foreground">
              {updatedLabel ?? "—"}
            </span>
          </span>
        </div>
      </CardContent>
      {actions ? (
        <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-border/60 bg-muted/20">
          {actions}
        </CardFooter>
      ) : null}
    </Card>
  );
}

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};
