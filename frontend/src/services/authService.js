import axiosClient from '../api/axiosClient';

export const register = ({ name, email, password }) =>
    axiosClient.post('/api/auth/register', { name, email, password });

export const login = async ({ email, password }) => {
    const data = await axiosClient.post('/api/auth/login', { email, password });
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
};