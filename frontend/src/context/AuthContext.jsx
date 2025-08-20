import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import { setAccessToken as setAxiosAccessToken, apiPublic } from '../api/axiosInstance';
import { AuthContext } from './AuthContextObject.js';
import { MOCK_USERS, getMockUserByEmail } from '../data/mockUsers.js';

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
        queryFn: async () => {
            try {
                // Пытаемся получить профиль через API
                return await api.getMyProfile();
            } catch (error) {
                console.log('API profile fetch failed:', error);
                
                // Если это моковый токен, возвращаем моковые данные
                if (accessToken && accessToken.startsWith('mock_token_')) {
                    // Пытаемся найти уже сохраненные данные
                    const existingData = queryClient.getQueryData(['me']);
                    if (existingData) {
                        console.log('Returning cached mock user data:', existingData);
                        return existingData;
                    }
                    
                    // Если данных нет, это означает проблему - не должно такого быть
                    console.error('Mock token found but no user data cached!');
                    throw new Error('No user data available for mock token');
                }
                
                throw error;
            }
        },
        enabled: !!accessToken,
        retry: 1,
        onError: () => {
          setAccessToken(null);
        }
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            try {
                // Пытаемся войти через API
                return await api.loginUser(credentials);
            } catch (error) {
                console.log('API login failed, trying mock users:', error);
                
                // Если API недоступен, проверяем моковых пользователей
                const mockUser = getMockUserByEmail(credentials.email);
                if (mockUser && mockUser.password === credentials.password) {
                    console.log('Mock login successful for:', credentials.email);
                    
                    // Имитируем ответ API
                    return {
                        access_token: `mock_token_${Date.now()}`,
                        user: mockUser.userData
                    };
                }
                
                // Если не найден моковый пользователь, выбрасываем оригинальную ошибку
                throw error;
            }
        },
        onSuccess: (data) => {
            if (data?.access_token) {
                setAccessToken(data.access_token);
                
                // Если это моковые данные, сохраняем пользователя сразу
                if (data.user && data.access_token.startsWith('mock_token_')) {
                    queryClient.setQueryData(['me'], data.user);
                }
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
                //ignore
                

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

