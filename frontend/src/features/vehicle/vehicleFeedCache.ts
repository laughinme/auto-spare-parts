import type { InfiniteData } from "@tanstack/react-query"

import type { CursorPageDto, VehicleDto } from "@/entities/vehicle/api"
import type { Vehicle } from "@/entities/vehicle/model/types"
import { fromVehicle } from "@/entities/vehicle/model/adapters"

export const VEHICLE_FEED_QUERY_KEY = ["vehicle-feed"] as const

export type VehicleFeedInfiniteData = InfiniteData<
  CursorPageDto<VehicleDto>,
  string | null
>

export function prependVehicleToFeed(
  data: VehicleFeedInfiniteData | undefined,
  vehicle: Vehicle,
): VehicleFeedInfiniteData {
  const vehicleDto = fromVehicle(vehicle)

  if (!data) {
    return {
      pageParams: [null],
      pages: [
        {
          items: [vehicleDto],
          next_cursor: null,
        },
      ],
    }
  }

  const pages = data.pages.map((page, index) => {
    const filteredItems = page.items.filter((item) => item.id !== vehicleDto.id)

    if (index === 0) {
      return {
        ...page,
        items: [vehicleDto, ...filteredItems],
      }
    }

    return {
      ...page,
      items: filteredItems,
    }
  })

  return {
    ...data,
    pages,
  }
}

export function removeVehicleFromFeed(
  data: VehicleFeedInfiniteData | undefined,
  vehicleId: string | null | undefined,
): VehicleFeedInfiniteData | undefined {
  if (!data || !vehicleId) {
    return data
  }

  let mutated = false
  const pages = data.pages.map((page) => {
    const filteredItems = page.items.filter((item) => item.id !== vehicleId)
    if (filteredItems.length !== page.items.length) {
      mutated = true
      return {
        ...page,
        items: filteredItems,
      }
    }
    return page
  })

  if (!mutated) {
    return data
  }

  return {
    ...data,
    pages,
  }
}

export function updateVehicleInFeed(
  data: VehicleFeedInfiniteData | undefined,
  vehicle: Vehicle,
): VehicleFeedInfiniteData | undefined {
  if (!data) {
    return data
  }

  const vehicleDto = fromVehicle(vehicle)
  let mutated = false

  const pages = data.pages.map((page) => {
    let pageMutated = false
    const items = page.items.map((item) => {
      if (item.id === vehicleDto.id) {
        mutated = true
        pageMutated = true
        return vehicleDto
      }
      return item
    })

    return pageMutated
      ? {
          ...page,
          items,
        }
      : page
  })

  if (!mutated) {
    return data
  }

  return {
    ...data,
    pages,
  }
}
