import type { Vehicle } from "@/entities/vehicle/model/types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

type VehicleDetailsWidgetProps = {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
};

export function VehicleDetailsWidget({
  vehicle,
  onEdit,
  onDelete,
}: VehicleDetailsWidgetProps) {
  const {
    make,
    model,
    year,
    vehicleType,
    vin,
    comment,
    createdAt,
    updatedAt,
    id,
    userId,
  } = vehicle;

  const createdLabel = formatDate(createdAt);
  const updatedLabel = formatDate(updatedAt);

  return (
    <Card className="border-border/60">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-2xl font-semibold leading-tight text-foreground">
              {make.makeName} {model.modelName}
            </CardTitle>
            <Badge variant="secondary" className="uppercase tracking-wide">
              {vehicleType.name}
            </Badge>
          </div>
          <CardDescription className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {year || "—"}
            </span>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <span className="font-mono text-xs uppercase tracking-wide">
              VIN: {vin || "—"}
            </span>
          </CardDescription>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onEdit(vehicle)}
              >
                Редактировать
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(vehicle)}
              >
                Удалить
              </Button>
            ) : null}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Марка" value={make.makeName} />
          <InfoItem label="Модель" value={model.modelName} />
          <InfoItem label="Год выпуска" value={year ? String(year) : "—"} />
          <InfoItem label="Тип" value={vehicleType.name} />
          <InfoItem label="VIN" value={vin || "—"} mono />
          <InfoItem label="ID автомобиля" value={id} mono />
          <InfoItem label="ID владельца" value={userId || "—"} mono />
        </dl>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Комментарий
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {comment?.trim()
                ? comment
                : "Комментарий отсутствует. Добавьте заметки, чтобы помнить важные детали."}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <MetadataItem
                label="Создан"
                value={createdLabel ?? "—"}
              />
              <MetadataItem
                label="Обновлён"
                value={updatedLabel ?? "—"}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function InfoItem({ label, value, mono = false }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-4">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-2 text-base font-medium text-foreground",
          mono && "font-mono text-sm uppercase tracking-wide",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

type MetadataItemProps = {
  label: string;
  value: string;
};

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
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
}
