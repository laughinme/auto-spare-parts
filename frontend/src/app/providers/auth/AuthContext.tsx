import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, loginUser, logoutUser, registerUser } from "@/entities/auth/api";
import {
  apiPublic,
  setAccessToken as setAxiosAccessToken,
  setUnauthorizedHandler as setAxiosUnauthorizedHandler
} from "@/shared/api/axiosInstance";
import { AuthContext } from "./AuthContextObject";
import type { AuthContextValue, AuthCredentials, AuthTokens, AuthUser } from "@/entities/auth/model";

interface AuthProviderProps {
  children: ReactNode;
}

const SKIP_REFRESH_KEY = "auth:skipRefresh";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);
  const hasAttemptedSessionRestore = useRef<boolean>(false);

  const clearSession = useCallback((): void => {
    setAccessToken(null);
    setAxiosAccessToken(null);
    queryClient.removeQueries({ queryKey: ["me"] });
  }, [queryClient]);

  useEffect(() => {
    setAxiosAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    setAxiosUnauthorizedHandler(clearSession);
    return () => setAxiosUnauthorizedHandler(null);
  }, [clearSession]);

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
    error: userError
  } = useQuery<AuthUser>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await getMyProfile();
      } catch (error) {
        console.log("API profile fetch failed:", error);
        throw error;
      }
    },
    enabled: Boolean(accessToken),
    retry: 1
  });

  const loginMutation = useMutation<AuthTokens, unknown, AuthCredentials>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SKIP_REFRESH_KEY);
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });

  const registerMutation = useMutation<AuthTokens, unknown, AuthCredentials>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SKIP_REFRESH_KEY);
      }
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });

  const logoutMutation = useMutation<void, unknown, void>({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
    onError: () => {
      clearSession();
      queryClient.clear();
    }
  });

  useEffect(() => {
    if (isError) {
      console.error("Ошибка useQuery('me'): Не удалось загрузить профиль. Выход из системы.", userError);
      clearSession();
    }
  }, [isError, userError, clearSession]);

  useEffect(() => {
    if (hasAttemptedSessionRestore.current) {
      return;
    }

    const shouldSkipRefresh =
      typeof window !== "undefined" &&
      sessionStorage.getItem(SKIP_REFRESH_KEY) === "true";

    if (shouldSkipRefresh) {
      hasAttemptedSessionRestore.current = true;
      setIsRestoringSession(false);
      return;
    }

    hasAttemptedSessionRestore.current = true;

    (async () => {
      try {
        const csrfToken = document.cookie
          .split(";")
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith("csrf_token="))
          ?.split("=")
          .at(1);

        const decodedCsrfToken = csrfToken ? decodeURIComponent(csrfToken) : null;

        if (!decodedCsrfToken) {
          console.log("[Auth] CSRF-токен не найден, прекращаем попытку восстановления.");
          return;
        }

        const { data } = await apiPublic.post<AuthTokens>(
          "/auth/refresh",
          {},
          {
            headers: { "X-CSRF-Token": decodedCsrfToken },
            withCredentials: true
          }
        );

        if (data?.access_token) {
          setAccessToken(data.access_token);
        }
      } catch (err) {
        console.error("[Auth] Ошибка при запросе на /auth/refresh:", err);
      } finally {
        setIsRestoringSession(false);
      }
    })();
  }, []);

  const handleLogout = (): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SKIP_REFRESH_KEY, "true");
    }
    logoutMutation.mutate();
  };

  const value: AuthContextValue = {
    user: !isError && user ? user : null,
    isUserLoading,
    isRestoringSession,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
