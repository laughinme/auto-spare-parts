import type { OrganizationDto } from "@/shared/api/organizations";
import type { Organization } from "./types";

export const toOrganization = (dto: OrganizationDto): Organization => ({
  id: dto.id,
  name: dto.name,
  country: dto.country,
  createdAt: dto.created_at,
});

export const toOrganizations = (dtos: OrganizationDto[]): Organization[] =>
  dtos.map(toOrganization);