import { useMemo } from "react";
import { AlertTriangle, Car, Loader2 } from "lucide-react";

import { useVehicleFeedInfinite } from "@/features/vehicle/useVehicleFeed";
import { VehicleCard, VehicleRow } from "@/entities/vehicle/ui";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";

const INITIAL_SKELETON_COUNT = 4;

export function GarageVehiclesWidget() {
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

  return (
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
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
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
                  <VehicleRow key={vehicle.id} vehicle={vehicle} />
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
  );
}
