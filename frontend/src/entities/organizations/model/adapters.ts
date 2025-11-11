import type { OrganizationDto } from "@/shared/api/organizations";
import type { Organization } from "./types";
import type { UserPosDto } from "@/shared/api/organizations";
import type { UserPos } from "./types";

export const toOrganization = (dto: OrganizationDto): Organization => ({
  id: dto.id,
  name: dto.name,
  country: dto.country,
  address: dto.address,
  createdAt: dto.created_at,
});

export const toOrganizations = (dtos: OrganizationDto[]): Organization[] =>
  dtos.map(toOrganization);

export const toUserPos = (dto: UserPosDto): UserPos => ({
  orgId: dto.org_id,
  userId: dto.user_id,
  role: dto.role,
  invitedBy: {
    id: dto.invited_by.id,
    username: dto.invited_by.username,
  },
  invitedAt: dto.invited_at ?? null,
  acceptedAt: dto.accepted_at ?? null,
});