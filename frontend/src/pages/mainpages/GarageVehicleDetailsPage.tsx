import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { ROUTE_PATHS } from "@/app/routes";
import type { Vehicle } from "@/entities/vehicle/model/types";
import { useVehicleDetails } from "@/entities/vehicle/model/useVehicleDetails";
import { useRemoveFromGarage } from "@/features/vehicle/useRemoveFromGarage";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { VehicleDetailsWidget } from "@/widgets/vehicle/ui/VehicleDetailsWidget";
import { EditVehicleDialog } from "@/widgets/vehicle/ui/EditVehicleDialog";

export default function GarageVehicleDetailsPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const removeVehicleMutation = useRemoveFromGarage();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useVehicleDetails(vehicleId);

  if (!vehicleId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Не найден идентификатор автомобиля. Вернитесь назад и выберите запись ещё раз.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const vehicle: Vehicle | null = data ?? null;

  const handleDeleteDialogChange = (nextOpen: boolean) => {
    setDeleteDialogOpen(nextOpen);
    if (!nextOpen) {
      removeVehicleMutation.reset();
    }
  };

  const handleConfirmDelete = () => {
    if (!vehicle) {
      return;
    }

    removeVehicleMutation.mutate(
      { vehicleId: vehicle.id },
      {
        onSuccess: () => {
          toast.success("Автомобиль удалён из гаража");
          handleDeleteDialogChange(false);
          navigate(ROUTE_PATHS.buyer.garage, { replace: true });
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate(-1)}
              disabled={isLoading || isFetching}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Назад
            </Button>
          </div>

          {isLoading && <VehicleDetailsSkeleton />}

          {!isLoading && (isError || !vehicle) && (
            <VehicleDetailsErrorState onRetry={refetch} />
          )}

          {!isLoading && !isError && vehicle ? (
            <VehicleDetailsWidget
              vehicle={vehicle}
              onEdit={() => setEditDialogOpen(true)}
              onDelete={() => setDeleteDialogOpen(true)}
            />
          ) : null}
        </div>
      </div>

      <EditVehicleDialog
        vehicle={vehicle}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить автомобиль</DialogTitle>
            <DialogDescription>
              Действие нельзя будет отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Вы уверены, что хотите удалить автомобиль?</p>
            {vehicle ? (
              <p className="font-medium text-foreground">
                {vehicle.make.makeName} {vehicle.model.modelName}, {vehicle.year}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDeleteDialogChange(false)}
              disabled={removeVehicleMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={removeVehicleMutation.isPending}
            >
              {removeVehicleMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ErrorStateProps = {
  onRetry: () => void;
};

function VehicleDetailsErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Card className="border border-destructive/40 bg-destructive/10">
      <CardContent className="flex flex-col gap-4 py-6 text-sm text-destructive">
        <div className="space-y-1">
          <p className="font-semibold">
            Не удалось загрузить данные автомобиля
          </p>
          <p className="text-muted-foreground">
            Проверьте соединение с сетью и повторите попытку.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() => onRetry()}
        >
          <RefreshCcw className="size-4" aria-hidden />
          Повторить
        </Button>
      </CardContent>
    </Card>
  );
}

function VehicleDetailsSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`vehicle-detail-skeleton-${index}`}
              className="rounded-lg border border-border/60 bg-background/60 p-4"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-16 w-full" />
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-4 w-36" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
