import { useQuery } from "@tanstack/react-query";

import { getOrganizationUserPositions, type UserPosDto } from "@/shared/api/organizations";
import type { UserPos } from "./types";
import { toUserPos } from "./adapters";

export function useOrganizationMyPosition(orgId?: string | null) {
  const enabled = !!orgId && orgId.trim().length > 0;
  return useQuery<UserPosDto, unknown, UserPos>({
    queryKey: ["organization","me", orgId ?? null],
    queryFn: () => getOrganizationUserPositions(orgId as string),
    select: toUserPos,
    enabled,
    staleTime: 60_000,
  });
}