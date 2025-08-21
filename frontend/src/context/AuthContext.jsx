import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';
import { setAccessToken as setAxiosAccessToken, apiPublic } from '../api/axiosInstance';
import { AuthContext } from './AuthContextObject.js';
import { MOCK_USERS, getMockUserByEmail } from '../data/mockUsers.js';

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [accessToken, setAccessToken] = useState(null);
    // НОВОЕ СОСТОЯНИЕ: true, пока мы пытаемся восстановить сессию
    const [isRestoringSession, setIsRestoringSession] = useState(true);

    useEffect(() => {
        setAxiosAccessToken(accessToken);
    }, [accessToken]);

    const { data: user, isLoading: isUserLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                return await api.getMyProfile();
            } catch (error) {
                console.log('API profile fetch failed:', error);
                if (accessToken && accessToken.startsWith('mock_token_')) {
                    const existingData = queryClient.getQueryData(['me']);
                    if (existingData) {
                        console.log('Returning cached mock user data:', existingData);
                        return existingData;
                    }
                    console.error('Mock token found but no user data cached!');
                    throw new Error('No user data available for mock token');
                }
                throw error;
            }
        },
        enabled: !!accessToken,
        retry: 1,
        onError: (err) => {
            console.error("ОШИБКА useQuery('me'): Не удалось загрузить профиль. Выход из системы.", err);
            setAccessToken(null);
        }
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            try {
                return await api.loginUser(credentials);
            } catch (error) {
                console.log('API login failed, trying mock users:', error);
                const mockUser = getMockUserByEmail(credentials.email);
                if (mockUser && mockUser.password === credentials.password) {
                    console.log('Mock login successful for:', credentials.email);
                    return {
                        access_token: `mock_token_${Date.now()}`,
                        user: mockUser.userData
                    };
                }
                throw error;
            }
        },
        onSuccess: (data) => {
            if (data?.access_token) {
                setAccessToken(data.access_token);
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

    useEffect(() => {
        console.log("--- [Auth] Запускаем useEffect для восстановления сессии ---");
        (async () => {
            try {
                const csrfCookie = document.cookie
                    .split(';')
                    .map((c) => c.trim())
                    .find((c) => c.startsWith('csrf_token='));

                const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;

                if (!csrfToken) {
                    console.log("[Auth] CSRF-токен не найден, прекращаем попытку восстановления.");
                    return;
                }

                console.log("[Auth] CSRF-токен найден, отправляем запрос на /auth/refresh...");
                const { data } = await apiPublic.post('/auth/refresh', {}, {
                    headers: { 'X-CSRF-Token': csrfToken },
                    withCredentials: true,
                });

                if (data?.access_token) {
                    console.log("[Auth] Успех! Устанавливаем новый access_token.");
                    setAccessToken(data.access_token);
                }
            } catch (err) {
                console.error("[Auth] ОШИБКА при запросе на /auth/refresh:", err);
            } finally {
                // Этот блок выполнится всегда, сообщая App.jsx, что проверка завершена
                console.log("[Auth] --- Попытка восстановления сессии завершена ---");
                setIsRestoringSession(false);
            }
        })();
    }, []);

    const value = {
        user: isError ? null : user,
        isUserLoading,
        isRestoringSession, // Добавляем новое состояние в контекст
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
