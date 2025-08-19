import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import { setAccessToken as setAxiosAccessToken, apiPublic } from '../api/axiosInstance';
import { AuthContext } from './AuthContextObject.js';

// Context moved to separate file to satisfy Fast Refresh rules

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        // keep axiosProtected aware via module-level var
        setAxiosAccessToken(accessToken);
    }, [accessToken]);

    const { data: user, isLoading: isUserLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: api.getMyProfile,
        enabled: !!accessToken,
        retry: 1,
        onError: () => {
          setAccessToken(null);
        }
    });

    const loginMutation = useMutation({
        mutationFn: api.loginUser,
        onSuccess: (data) => {
            if (data?.access_token) {
                setAccessToken(data.access_token);
            }
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: api.registerUser,
        onSuccess: (data) => {
            if (data?.access_token) {
                setAccessToken(data.access_token);
            }
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
    
    const logoutMutation = useMutation({
        mutationFn: api.logoutUser,
        onSuccess: () => {
            setAccessToken(null);
            queryClient.clear();
        },
        onError: () => {
            setAccessToken(null);
            queryClient.clear();
        }
    });

    // Bootstrap on mount: try refresh to get an access token if cookies present
    useEffect(() => {
        (async () => {
            try {
                const csrfCookie = document.cookie
                    .split(';')
                    .map((c) => c.trim())
                    .find((c) => c.startsWith('csrf_token='));
                const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
                if (!csrfToken) return;
                const { data } = await apiPublic.post('/auth/refresh', {}, {
                    headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
                    withCredentials: true,
                });
                if (data?.access_token) {
                    setAccessToken(data.access_token);
                }
            } catch {
                // ignore
            }
        })();
    }, []);

    const value = {
        user: isError ? null : user,
        isUserLoading,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isLoading,
        loginError: loginMutation.error,
        isRegistering: registerMutation.isLoading,
        registerError: registerMutation.error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook moved to separate file to satisfy React Fast Refresh rules