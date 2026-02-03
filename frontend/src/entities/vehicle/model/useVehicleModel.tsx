import { getVehicleModels } from "@/entities/vehicle/api";
import { toVehicleModels } from "../model/adapters";
import { useQuery } from "@tanstack/react-query";

export function useVehicleModels(
  params: { limit?: number; search?: string | null; make_id?: number | null } = {},
) {
  const { limit = 50, search = null, make_id = null } = params;
  const makeId = typeof make_id === "number" && Number.isFinite(make_id) ? make_id : null;

  return useQuery({
    queryKey: ["vehicle-models", { limit, search, make_id: makeId }],
    queryFn: () =>
      getVehicleModels({
        make_id: makeId as number,
        limit,
        search,
      }),
    enabled: makeId !== null,
    select: toVehicleModels,
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });
}
