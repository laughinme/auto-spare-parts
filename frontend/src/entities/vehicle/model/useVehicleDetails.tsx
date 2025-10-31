import { useQuery } from "@tanstack/react-query"

import { getVehicleDetails } from "@/shared/api/vehicles"
import { toVehicle } from "./adapters"
import { vehicleDetailQueryKey } from "./queryKeys"

const PLACEHOLDER_KEY = ["vehicle", "__placeholder__"] as const

export function useVehicleDetails(vehicleId: string | null | undefined) {
  const rawId =
    typeof vehicleId === "string" && vehicleId.trim() !== "" ? vehicleId : null
  const targetId = rawId ? safeDecode(rawId) : null

  return useQuery({
    queryKey: targetId ? vehicleDetailQueryKey(targetId) : PLACEHOLDER_KEY,
    queryFn: () => getVehicleDetails(targetId as string),
    select: toVehicle,
    enabled: targetId !== null,
    staleTime: 30_000,
  })
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
