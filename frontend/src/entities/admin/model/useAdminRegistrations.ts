import { useQuery } from "@tanstack/react-query";

import {
  getAdminRegistrations,
  type RegistrationStatDto,
} from "@/entities/admin/api";

export const useAdminRegistrations = (days = 30, enabled = true) =>
  useQuery<RegistrationStatDto[]>({
    queryKey: ["admin-registrations", days],
    queryFn: () => getAdminRegistrations(days),
    enabled,
    staleTime: 60_000,
  });
