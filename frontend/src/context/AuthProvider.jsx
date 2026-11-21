import { useState } from 'react';
import { AuthContext } from './authContext';
import * as authService from '../services/authService';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

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
