import apiProtected, { apiPublic } from './axiosInstance';

export const registerUser = async (credentials) => {
    const response = await apiPublic.post('/auth/register', credentials, {
        headers: { 'X-Client': 'web' },
        withCredentials: true,
    });
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiPublic.post('/auth/login', credentials, {
        headers: { 'X-Client': 'web' },
        withCredentials: true,
    });
    return response.data;
};

export const logoutUser = async () => {
    const response = await apiProtected.post('/auth/logout');
    return response.data;
};

export const getMyProfile = async () => {
    const response = await apiProtected.get('/users/me/');
    return response.data;
};