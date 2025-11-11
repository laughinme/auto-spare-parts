import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { getOrganizationUserPositions, type UserPosDto } from "@/shared/api/organizations";
import type { UserPos } from "./types";
import { toUserPos } from "./adapters";

export function useOrganizationMyPosition(orgId?: string | null) {
  const normalizedOrgId = orgId?.trim() ?? "";
  const enabled = normalizedOrgId.length > 0;

  return useQuery<UserPosDto | null, unknown, UserPos | null>({
    queryKey: ["organization", "me", enabled ? normalizedOrgId : null],
    queryFn: async () => {
      if (!enabled) {
        return null;
      }

      try {
        return await getOrganizationUserPositions(normalizedOrgId);
      } catch (error) {
        if (isAxiosError(error)) {
          const status = error.response?.status ?? 0;
          if (status === 403 || status === 404) {
            return null;
          }
        }
        throw error;
      }
    },
    select: (data) => (data ? toUserPos(data) : null),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
