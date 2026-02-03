import { useQuery } from "@tanstack/react-query";

import { getOrganizationDetails, type OrganizationDto } from "@/entities/organizations/api";
import { toOrganization } from "./adapters";
import type { Organization } from "./types";

export function useOrganizationDetails(orgId: string) {
    return useQuery<OrganizationDto, unknown, Organization>({
        queryKey: ["organizations-details", orgId ],
        queryFn: () => getOrganizationDetails(orgId),    
        select: toOrganization,
        staleTime: 60_000,
    });

}
