import apiProtected from "@/shared/api/axiosInstance";

export type AdminOrganizationDto = {
  created_at: string;
  updated_at: string;
  id: string;
  type: "supplier" | "workshop" | string;
  name: string;
  country: string;
  address: string | null;
  stripe_account_id: string | null;
  kyc_status: string;
  payout_schedule: string;
};

export type AdminUserDto = {
  created_at: string;
  updated_at: string;
  id: string;
  email: string;
  organization: AdminOrganizationDto | null;
  username: string | null;
  profile_pic_url: string | null;
  bio: string | null;
  language_code: string | null;
  is_onboarded: boolean;
  banned: boolean;
  role_slugs: string[];
};

export type AdminUsersPageDto = {
  items: AdminUserDto[];
  next_cursor: string | null;
};

export type AdminUsersListParams = {
  banned?: boolean | null;
  search?: string | null;
  limit?: number;
  cursor?: string | null;
};

export const getAdminUsers = async (
  params: AdminUsersListParams = {}
): Promise<AdminUsersPageDto> => {
  const response = await apiProtected.get<AdminUsersPageDto>("/admins/users", {
    params: {
      banned: params.banned ?? undefined,
      search: params.search ?? undefined,
      limit: params.limit,
      cursor: params.cursor ?? undefined,
    },
  });
  return response.data;
};

export type AdminBanRequest = {
  banned: boolean;
};

export const setAdminUserBanned = async (
  userId: string,
  payload: AdminBanRequest
): Promise<AdminUserDto> => {
  const response = await apiProtected.post<AdminUserDto>(
    `/admins/users/${userId}/ban`,
    payload
  );
  return response.data;
};

export type RegistrationStatDto = {
  day: string;
  count: number;
};

export const getAdminRegistrations = async (
  days = 30
): Promise<RegistrationStatDto[]> => {
  const response = await apiProtected.get<RegistrationStatDto[]>(
    "/admins/stats/registrations",
    {
      params: { days },
    }
  );
  return response.data;
};
