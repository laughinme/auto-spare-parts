import apiProtected from "./axiosInstance";

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
  created_at: string;
};

export async function getOrganizationsList(): Promise<OrganizationDto[]> {
  const response = await apiProtected.get<OrganizationDto[]>("/organizations/mine");
  return response.data;
}