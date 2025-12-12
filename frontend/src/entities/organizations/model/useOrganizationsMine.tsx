import { useQuery } from "@tanstack/react-query";

import { getOrganizationsList, type OrganizationDto } from "@/entities/organizations/api";
import { toOrganizations } from "./adapters";
import type { Organization } from "./types";

export function useOrganizationsMine() {
  return useQuery<OrganizationDto[], unknown, Organization[]>({
    queryKey: ["organizations-mine"],
    queryFn: getOrganizationsList,
    select: toOrganizations,
    staleTime: 60_000,
  });
}