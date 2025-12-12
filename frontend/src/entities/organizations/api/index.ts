import apiProtected from "@/shared/api/axiosInstance";

export type OrganizationType = "supplier" | "workshop";
export type KycStatus = "not_started" | "pending" | "verified" | "rejected";
export type PayoutSchedule = "daily" | "weekly" | "monthly";
export type UserRoles = "owner" | "admin" | "staff" | "accountant";

export type StripeAccountResponse = {
  account: string;
};

export const createSupplierAccount = async (): Promise<StripeAccountResponse> => {
  const response = await apiProtected.post<StripeAccountResponse>("/organizations/account");
  return response.data;
};

export type StripeAccountSessionRequest = {
  account: string;
};

export type StripeAccountSessionResponse = {
  client_secret: string;
};

export const createSupplierAccountSession = async (
  payload: StripeAccountSessionRequest
): Promise<StripeAccountSessionResponse> => {
  const response = await apiProtected.post<StripeAccountSessionResponse>(
    "/organizations/account_session",
    payload
  );
  return response.data;
};

export type OrganizationDto = {
  id: string;
  name: string;
  country: string;
  address: string | null;
  created_at: string;
};

export async function getOrganizationsList(): Promise<OrganizationDto[]> {
  const response = await apiProtected.get<OrganizationDto[]>("/organizations/mine");
  return response.data;
}

export async function getOrganizationDetails(orgId: string): Promise<OrganizationDto> {
  const encodedOrgId = encodeURIComponent(orgId);
  const response = await apiProtected.get<OrganizationDto>(`/organizations/${encodedOrgId}/`);
  return response.data;
}

export type UserPosDto ={
  org_id: string;
  user_id: string;
  role: UserRoles;
  invited_by:{
    id: string;
    username: string;
  }
  invited_at: string | null;
  accepted_at: string | null;
}

export async function getOrganizationUserPositions(orgId: string): Promise<UserPosDto> {
  const encodedOrgId = encodeURIComponent(orgId);
  const response = await apiProtected.get<UserPosDto>(`/organizations/${encodedOrgId}/me/`);
  return response.data;
}
