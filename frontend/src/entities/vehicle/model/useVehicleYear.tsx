import { useQuery } from "@tanstack/react-query";

import { getVehicleYears } from "@/entities/vehicle/api";

export function useVehicleYears(params: { model_id?: number | null } = {}) {
  const modelId =
    typeof params.model_id === "number" && Number.isFinite(params.model_id)
      ? params.model_id
      : null;

  return useQuery({
    queryKey: ["vehicle-years", modelId],
    queryFn: () =>
      getVehicleYears({
        model_id: modelId as number,
      }),
    enabled: modelId !== null,
    select: (years) => [...years].sort((a, b) => b - a),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });
}
