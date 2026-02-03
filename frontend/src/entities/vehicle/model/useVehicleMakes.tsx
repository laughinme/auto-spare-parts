import {getVehiclesMakes} from '@/entities/vehicle/api';
import { toVehicleMakes } from '../model/adapters';
import { useQuery } from '@tanstack/react-query';

export function useVehicleMakes(params: { limit?: number; search?: string | null } = {}) {
  const { limit = 50, search = null } = params;

  return useQuery({
    queryKey: ["vehicle-makes", { limit, search }],
    queryFn: () => getVehiclesMakes({ limit, search }),
    select: toVehicleMakes,
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });
}