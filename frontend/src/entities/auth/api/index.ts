import axios from "axios";

import apiProtected, { apiPublic } from "@/shared/api/axiosInstance";
import type { AuthCredentials, AuthTokens, AuthUser } from "@/entities/auth/model";

export const registerUser = async (credentials: AuthCredentials): Promise<AuthTokens> => {
  const response = await apiPublic.post<AuthTokens>("/auth/register", credentials, {
    headers: { "X-Client": "web" },
    withCredentials: true
  });
  return response.data;
};

export const loginUser = async (credentials: AuthCredentials): Promise<AuthTokens> => {
  const response = await apiPublic.post<AuthTokens>("/auth/login", credentials, {
    headers: { "X-Client": "web" },
    withCredentials: true
  });
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiProtected.post("/auth/logout");
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return;
    }
    throw error;
  }
};

export const getMyProfile = async (): Promise<AuthUser> => {
  const response = await apiProtected.get<AuthUser>("/users/me/");
  return response.data;
};
