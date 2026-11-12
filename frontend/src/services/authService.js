import axiosClient from '../api/axiosClient';

export const register = ({ name, email, password }) =>
    axiosClient.post('/api/auth/register', { name, email, password });

export const login = async ({ email, password }) => {
  const result = await axiosClient.post('/api/auth/login', { email, password });
  const { token, user } = result.data;
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
};