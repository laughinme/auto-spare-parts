import type { ReactNode } from "react";

import type { Vehicle } from "@/entities/vehicle/model/types";
import { Badge } from "@/shared/components/ui/badge";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type VehicleRowProps = {
  vehicle: Vehicle;
  actions?: ReactNode;
  className?: string;
  onClick?: (vehicle: Vehicle) => void;
};

export function VehicleRow({
  vehicle,
  actions,
  className,
  onClick,
}: VehicleRowProps) {
  const { make, model, year, vehicleType, vin, comment } = vehicle;
  const handleRowClick = () => {
    if (onClick) {
      onClick(vehicle);
    }
  };

  return (
    <TableRow
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={handleRowClick}
      data-state={onClick ? "selectable" : undefined}
    >
      <TableCell className="w-full min-w-[240px]">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold leading-tight text-foreground">
            {make.makeName} {model.modelName}
          </span>
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            VIN: {vin || "—"}
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
        {year || "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge variant="secondary" className="capitalize">
          {vehicleType.name}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[280px]">
        {comment ? (
          <span
            className="block truncate text-sm text-muted-foreground"
            title={comment}
          >
            {comment}
          </span>
        ) : (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Без комментария
          </span>
        )}
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap text-right align-middle">
        {actions}
      </TableCell>
    </TableRow>
  );
}
