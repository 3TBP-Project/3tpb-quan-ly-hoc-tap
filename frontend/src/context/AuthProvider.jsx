import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import * as authService from '../services/authService';
import axiosClient from '../api/axiosClient';

// Kiểm tra lại tài khoản định kỳ và mỗi khi người dùng quay lại tab,
// để tài khoản bị khóa giữa chừng bị đăng xuất kể cả khi chưa thao tác gì.
// Nếu bị khóa, interceptor của axiosClient sẽ tự đá về trang chủ.
const SESSION_CHECK_INTERVAL = 60 * 1000;

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    if (!isLoggedIn) return undefined;
    const checkSession = () => {
      if (document.visibilityState === 'hidden') return;
      axiosClient.get('/api/users/profile').then((res) => {
        // Đồng bộ họ tên / ảnh đại diện mới nhất (ví dụ phiên đăng nhập cũ chưa có avatar)
        const profile = res?.data;
        if (!profile) return;
        setUser((current) => {
          if (!current) return current;
          const avatar = profile.avatar ?? null;
          if (current.name === profile.name && (current.avatar ?? null) === avatar) return current;
          const next = { ...current, name: profile.name, avatar };
          localStorage.setItem('user', JSON.stringify(next));
          return next;
        });
      }).catch(() => {
        // Lỗi mạng tạm thời thì bỏ qua; khóa tài khoản / hết phiên đã được interceptor xử lý
      });
    };
    checkSession();
    const timer = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', checkSession);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', checkSession);
    };
  }, [isLoggedIn]);

  const login = async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Cập nhật thông tin người dùng đang đăng nhập (ví dụ đổi họ tên ở trang Hồ sơ – HT-07)
  const updateUser = (patch) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const value = { user, role: user?.role ?? 'guest', login, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
