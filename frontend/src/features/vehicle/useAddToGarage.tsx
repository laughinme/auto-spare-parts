import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import {
  addVehicle,
  type AddVehicleBody,
  type VehicleDto,
} from "@/shared/api/vehicles"
import { toVehicle } from "@/entities/vehicle/model/adapters"
import type { Vehicle } from "@/entities/vehicle/model/types"
import {
  prependVehicleToFeed,
  removeVehicleFromFeed,
  VEHICLE_FEED_QUERY_KEY,
  type VehicleFeedInfiniteData,
} from "./vehicleFeedCache"

type AddVehicleMutationVariables = {
  payload: AddVehicleBody
  meta: {
    makeName: string
    modelName: string
    vehicleTypeName?: string
  }
}

type AddVehicleMutationContext = {
  previousData: VehicleFeedInfiniteData | undefined
  optimisticVehicleId: string
}

export function useAddToGarage() {
  const qc = useQueryClient()
  const vehicleFeedQueryKey = VEHICLE_FEED_QUERY_KEY

  return useMutation<
    VehicleDto,
    unknown,
    AddVehicleMutationVariables,
    AddVehicleMutationContext
  >({
    mutationKey: ["garage", "add-vehicle"],
    mutationFn: ({ payload }) => addVehicle(payload),

    async onMutate(variables) {
      await qc.cancelQueries({ queryKey: vehicleFeedQueryKey })

      const previousData = qc.getQueryData<VehicleFeedInfiniteData>(
        vehicleFeedQueryKey,
      )

      const optimisticVehicle = createOptimisticVehicle(variables)

      qc.setQueryData<VehicleFeedInfiniteData>(
        vehicleFeedQueryKey,
        (current) => prependVehicleToFeed(current, optimisticVehicle),
      )

      return {
        previousData,
        optimisticVehicleId: optimisticVehicle.id,
      }
    },

    onError(error, _variables, context) {
      if (context?.previousData) {
        qc.setQueryData(vehicleFeedQueryKey, context.previousData)
      }

      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ??
            "Не удалось добавить автомобиль. Попробуйте ещё раз."
          : "Произошла ошибка при добавлении автомобиля."

      toast.error(message)
    },

    onSuccess(response, _variables, context) {
      const vehicle = toVehicle(response)

      qc.setQueryData<VehicleFeedInfiniteData>(
        vehicleFeedQueryKey,
        (current) => {
          const withoutOptimistic = removeVehicleFromFeed(
            current,
            context?.optimisticVehicleId,
          )
          const withoutDuplicate = removeVehicleFromFeed(
            withoutOptimistic,
            vehicle.id,
          )

          return prependVehicleToFeed(withoutDuplicate, vehicle)
        },
      )
    },

    onSettled() {
      qc.invalidateQueries({
        queryKey: vehicleFeedQueryKey,
        refetchType: "active",
      })
    },
  })
}

function createOptimisticVehicle({
  payload,
  meta,
}: AddVehicleMutationVariables): Vehicle {
  const now = new Date().toISOString()
  const vehicleTypeName = meta.vehicleTypeName ?? "—"

  return {
    id: createOptimisticId(),
    userId: "",
    createdAt: now,
    updatedAt: now,
    make: {
      makeId: payload.make_id,
      makeName: meta.makeName,
    },
    model: {
      modelId: payload.model_id,
      makeId: payload.make_id,
      modelName: meta.modelName,
    },
    year: payload.year,
    vehicleType: {
      vehicleTypeId: payload.vehicle_type_id,
      name: vehicleTypeName,
    },
    vin: payload.vin ?? "",
    comment: payload.comment ?? "",
  }
}

function createOptimisticId() {
  const cryptoApi =
    typeof globalThis !== "undefined" ? (globalThis.crypto ?? undefined) : undefined

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return `optimistic-${cryptoApi.randomUUID()}`
  }

  return `optimistic-${Date.now()}`
}
