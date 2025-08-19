import apiClient from './axiosInstance';

export const registerUser = async (credentials) => {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

export const logoutUser = async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
};

export const getMyProfile = async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
};