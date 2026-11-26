// AI-assisted [AI-07]
import axios from 'axios';
import { forceLogoutLocked, isAccountLockedPayload } from '../utils/forceLogout';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 giây
});

// Gắn token vào mọi request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Trả về response.data; hết phiên (401) thì xóa token và về trang đăng nhập.
// 401 của chính request đăng nhập nghĩa là sai thông tin, không phải hết phiên.
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Tài khoản bị khóa khi đang đăng nhập: đá về trang chủ (khách vãng lai)
        if (error.response?.status === 403 && isAccountLockedPayload(error.response.data)) {
            forceLogoutLocked(error.response.data.message);
            return Promise.reject(error);
        }
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
