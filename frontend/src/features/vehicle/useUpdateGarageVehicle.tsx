import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import {
  updateVehicle,
  type UpdateVehicleBody,
  type VehicleDto,
} from "@/entities/vehicle/api"
import { toVehicle } from "@/entities/vehicle/model/adapters"
import type { Vehicle } from "@/entities/vehicle/model/types"
import { vehicleDetailQueryKey } from "@/entities/vehicle/model/queryKeys"
import {
  updateVehicleInFeed,
  VEHICLE_FEED_QUERY_KEY,
  type VehicleFeedInfiniteData,
} from "./vehicleFeedCache"

type UpdateVehicleVariables = {
  vehicleId: string
  payload: UpdateVehicleBody
  optimisticVehicle: Vehicle
}

type UpdateVehicleContext = {
  previousFeed: VehicleFeedInfiniteData | undefined
  previousDetail: Vehicle | undefined
}

export function useUpdateGarageVehicle() {
  const qc = useQueryClient()

  return useMutation<
    VehicleDto,
    unknown,
    UpdateVehicleVariables,
    UpdateVehicleContext
  >({
    mutationKey: ["garage", "update-vehicle"],
    mutationFn: ({ vehicleId, payload }) => updateVehicle(vehicleId, payload),

    async onMutate(variables) {
      const { vehicleId, optimisticVehicle } = variables

      await qc.cancelQueries({ queryKey: VEHICLE_FEED_QUERY_KEY })

      const detailKey = vehicleDetailQueryKey(vehicleId)
      await qc.cancelQueries({ queryKey: detailKey, exact: true })

      const previousFeed = qc.getQueryData<VehicleFeedInfiniteData>(
        VEHICLE_FEED_QUERY_KEY,
      )
      const previousDetail = qc.getQueryData<Vehicle>(detailKey)

      qc.setQueryData<VehicleFeedInfiniteData | undefined>(
        VEHICLE_FEED_QUERY_KEY,
        (current) =>
          updateVehicleInFeed(current, optimisticVehicle) ?? current,
      )
      qc.setQueryData(detailKey, optimisticVehicle)

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
            "Не удалось обновить автомобиль. Попробуйте ещё раз."
          : "Произошла ошибка при обновлении автомобиля."

      toast.error(message)
    },

    onSuccess(response, variables) {
      const vehicle = toVehicle(response)

      qc.setQueryData<VehicleFeedInfiniteData | undefined>(
        VEHICLE_FEED_QUERY_KEY,
        (current) => updateVehicleInFeed(current, vehicle) ?? current,
      )
      qc.setQueryData(vehicleDetailQueryKey(variables.vehicleId), vehicle)
    },

    onSettled(_response, variables) {
      qc.invalidateQueries({
        queryKey: VEHICLE_FEED_QUERY_KEY,
        refetchType: "active",
      })
      qc.invalidateQueries({
        queryKey: vehicleDetailQueryKey(variables.vehicleId),
        exact: true,
      })
    },
  })
}
