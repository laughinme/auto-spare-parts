import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import { removeVehicle } from "@/entities/vehicle/api"
import type { Vehicle } from "@/entities/vehicle/model/types"
import { vehicleDetailQueryKey } from "@/entities/vehicle/model/queryKeys"
import {
  removeVehicleFromFeed,
  VEHICLE_FEED_QUERY_KEY,
  type VehicleFeedInfiniteData,
} from "./vehicleFeedCache"

type RemoveVehicleVariables = {
  vehicleId: string
}

type RemoveVehicleContext = {
  previousFeed: VehicleFeedInfiniteData | undefined
  previousDetail: Vehicle | undefined
}

export function useRemoveFromGarage() {
  const qc = useQueryClient()

  return useMutation<void, unknown, RemoveVehicleVariables, RemoveVehicleContext>(
    {
      mutationKey: ["garage", "remove-vehicle"],
      mutationFn: ({ vehicleId }) => removeVehicle(vehicleId),

      async onMutate(variables) {
        const { vehicleId } = variables

        await qc.cancelQueries({ queryKey: VEHICLE_FEED_QUERY_KEY })

        const detailKey = vehicleDetailQueryKey(vehicleId)
        await qc.cancelQueries({ queryKey: detailKey, exact: true })

        const previousFeed = qc.getQueryData<VehicleFeedInfiniteData>(
          VEHICLE_FEED_QUERY_KEY,
        )
        const previousDetail = qc.getQueryData<Vehicle>(detailKey)

        qc.setQueryData<VehicleFeedInfiniteData | undefined>(
          VEHICLE_FEED_QUERY_KEY,
          (current) => removeVehicleFromFeed(current, vehicleId),
        )
        qc.setQueryData<Vehicle | undefined>(detailKey, undefined)

        return {
          previousFeed,
          previousDetail,
        }
      },

      onError(error, variables, context) {
        if (context) {
          qc.setQueryData(VEHICLE_FEED_QUERY_KEY, context.previousFeed)
          qc.setQueryData(
            vehicleDetailQueryKey(variables.vehicleId),
            context.previousDetail,
          )
        }

        const message =
          error instanceof AxiosError
            ? error.response?.data?.message ??
              "Не удалось удалить автомобиль. Попробуйте ещё раз."
            : "Произошла ошибка при удалении автомобиля."

        toast.error(message)
      },

      onSuccess(_response, variables) {
        qc.removeQueries({ queryKey: vehicleDetailQueryKey(variables.vehicleId), exact: true })
      },

      onSettled(_response, _variables) {
        qc.invalidateQueries({
          queryKey: VEHICLE_FEED_QUERY_KEY,
          refetchType: "active",
        })
      },
    },
  )
}
