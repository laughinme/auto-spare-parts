import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { getVehicles } from "@/entities/vehicle/api"
import { toVehicle } from "@/entities/vehicle/model/adapters"
import type { Vehicle } from "@/entities/vehicle/model/types"
import { VEHICLE_FEED_QUERY_KEY } from "./vehicleFeedCache"

type VehicleFeedPage = {
  items: Vehicle[]
  nextCursor: string | null
}

type VehicleFeedResult = {
  pages: VehicleFeedPage[]
  items: Vehicle[]
  nextCursor: string | null
}

export function useVehicleFeedInfinite() {
  const { data: rawData, ...rest } = useInfiniteQuery({
    queryKey: VEHICLE_FEED_QUERY_KEY,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => getVehicles({ cursor: pageParam, limit: 20 }),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
  })

  const data: VehicleFeedResult | undefined = useMemo(() => {
    if (!rawData) {
      return undefined
    }

    const pages = rawData.pages.map((page) => ({
      items: page.items.map(toVehicle),
      nextCursor: page.next_cursor ?? null,
    }))

    return {
      pages,
      items: pages.flatMap((page) => page.items),
      nextCursor: pages.at(-1)?.nextCursor ?? null,
    }
  }, [rawData])

  return {
    data,
    ...rest,
  }
}
