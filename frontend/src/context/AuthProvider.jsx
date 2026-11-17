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

  const value = { user, role: user?.role ?? 'guest', login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
