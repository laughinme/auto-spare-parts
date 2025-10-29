import { useInfiniteQuery } from "@tanstack/react-query";
import { getVehicles } from "@/shared/api/vehicles";
import { toVehicle } from "@/entities/vehicle/model/adapters";
import type { Vehicle } from "@/entities/vehicle/model/types";

export function useVehicleFeedInfinite() {
  return useInfiniteQuery({
    queryKey: ["vehicle-feed"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => getVehicles({ cursor: pageParam, limit: 20 }),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    select: (data) => ({
      pages: data.pages.map((p) => ({
        items: p.items.map(toVehicle),
        nextCursor: p.next_cursor,
      })),
      items: data.pages.flatMap((p) => p.items.map(toVehicle)) as Vehicle[],
      nextCursor: data.pages.at(-1)?.next_cursor ?? null,
    }),
    staleTime: 30_000,
  });
}