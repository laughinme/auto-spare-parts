import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Car,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { buildGarageVehicleDetailsPath } from "@/app/routes";
import type { Vehicle } from "@/entities/vehicle/model/types";
import { VehicleCard, VehicleRow } from "@/entities/vehicle/ui";
import { useRemoveFromGarage } from "@/features/vehicle/useRemoveFromGarage";
import { useVehicleFeedInfinite } from "@/features/vehicle/useVehicleFeed";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { EditVehicleDialog } from "./EditVehicleDialog";

const INITIAL_SKELETON_COUNT = 4;

export function GarageVehiclesWidget() {
  const navigate = useNavigate();

  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const removeVehicleMutation = useRemoveFromGarage();

  const {
    data,
    isLoading,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useVehicleFeedInfinite();

  const vehicles = data?.items ?? [];

  const showInitialSkeleton = isLoading && vehicles.length === 0;
  const showEmptyState = !isLoading && vehicles.length === 0 && !isError;
  const showErrorState = isError && vehicles.length === 0;

  const loaderLabel = useMemo(() => {
    if (isFetchingNextPage) {
      return "Загрузка...";
    }

    if (isFetching) {
      return "Обновление...";
    }

    return "Загрузить ещё";
  }, [isFetching, isFetchingNextPage]);

  const isOptimisticVehicle = (vehicle: Vehicle) =>
    vehicle.id.startsWith("optimistic-")

  const preventOptimisticAction = () => {
    toast.info("Подождите завершения сохранения автомобиля");
  }

  const handleNavigateToDetails = (vehicle: Vehicle) => {
    if (isOptimisticVehicle(vehicle)) {
      preventOptimisticAction();
      return;
    }

    navigate(buildGarageVehicleDetailsPath(vehicle.id));
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    if (isOptimisticVehicle(vehicle)) {
      preventOptimisticAction();
      return;
    }

    setVehicleToEdit(vehicle);
    setEditDialogOpen(true);
  };

  const handleEditDialogChange = (nextOpen: boolean) => {
    setEditDialogOpen(nextOpen);
    if (!nextOpen) {
      setVehicleToEdit(null);
    }
  };

  const handleOpenDelete = (vehicle: Vehicle) => {
    if (isOptimisticVehicle(vehicle)) {
      preventOptimisticAction();
      return;
    }

    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (nextOpen: boolean) => {
    setDeleteDialogOpen(nextOpen);
    if (!nextOpen) {
      setVehicleToDelete(null);
      removeVehicleMutation.reset();
    }
  };

  const handleConfirmDelete = () => {
    if (!vehicleToDelete) {
      return;
    }

    removeVehicleMutation.mutate(
      { vehicleId: vehicleToDelete.id },
      {
        onSuccess: () => {
          toast.success("Автомобиль удалён из гаража");
          handleDeleteDialogChange(false);
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {showErrorState ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <AlertTriangle className="size-10 text-destructive" aria-hidden />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Не удалось загрузить гараж
                </h3>
                <p className="text-sm text-muted-foreground">
                  Попробуйте обновить страницу или повторите попытку позже.
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Повторить попытку
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {showEmptyState ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Car className="size-12 text-muted-foreground" aria-hidden />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Гараж пока пуст
                </h3>
                <p className="text-sm text-muted-foreground">
                  Добавьте автомобили, чтобы получать точные подборки запчастей.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {showInitialSkeleton ? (
          <>
            <div className="grid gap-4 md:hidden">
              {Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, index) => (
                <Card key={`vehicle-card-skeleton-${index}`}>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Skeleton className="h-14 rounded-lg" />
                      <Skeleton className="h-14 rounded-lg" />
                    </div>
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Автомобиль</TableHead>
                    <TableHead>Год</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: INITIAL_SKELETON_COUNT }).map(
                    (_, index) => (
                      <TableRow key={`vehicle-row-skeleton-${index}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="mt-2 h-3 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-60" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-8 w-20" />
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : null}

        {vehicles.length > 0 ? (
          <>
            <div className="grid gap-4 md:hidden">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  actions={
                    <VehicleCardActions
                      onView={() => handleNavigateToDetails(vehicle)}
                      onEdit={() => handleOpenEdit(vehicle)}
                      onDelete={() => handleOpenDelete(vehicle)}
                    />
                  }
                />
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Автомобиль</TableHead>
                    <TableHead>Год</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <VehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      onClick={() => handleNavigateToDetails(vehicle)}
                      actions={
                        <VehicleRowActions
                          onView={() => handleNavigateToDetails(vehicle)}
                          onEdit={() => handleOpenEdit(vehicle)}
                          onDelete={() => handleOpenDelete(vehicle)}
                        />
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : null}

        {hasNextPage ? (
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
            >
              {isFetchingNextPage && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              )}
              {loaderLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <EditVehicleDialog
        vehicle={vehicleToEdit}
        open={editDialogOpen}
        onOpenChange={handleEditDialogChange}
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
            {vehicleToDelete ? (
              <p className="font-medium text-foreground">
                {vehicleToDelete.make.makeName} {vehicleToDelete.model.modelName},{" "}
                {vehicleToDelete.year}
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

type VehicleRowActionsProps = {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function VehicleRowActions({
  onView,
  onEdit,
  onDelete,
}: VehicleRowActionsProps) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
          >
            <MoreHorizontal className="size-4" aria-hidden />
            <span className="sr-only">Действия</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onView();
            }}
          >
            <Eye className="mr-2 size-4" aria-hidden />
            Подробнее
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="mr-2 size-4" aria-hidden />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="mr-2 size-4" aria-hidden />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type VehicleCardActionsProps = {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function VehicleCardActions({
  onView,
  onEdit,
  onDelete,
}: VehicleCardActionsProps) {
  return (
    <div
      className="flex w-full flex-wrap justify-end gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={(event) => {
          event.stopPropagation();
          onView();
        }}
      >
        Подробнее
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      >
        Редактировать
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        Удалить
      </Button>
    </div>
  );
}
