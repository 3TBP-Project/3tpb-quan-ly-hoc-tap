// AI-assisted [AI-08]
// API Quản lý người dùng (HT-14) – chỉ quản trị viên gọi được
import axiosClient from '../api/axiosClient';

const BASE = '/api/admin/users';

// Trả về { data: { users, total, counts, pagination } }
export const getUsers = ({ role, search, page, limit }, signal) =>
  axiosClient.get(BASE, {
    params: { role, search: search || undefined, page, limit },
    signal,
  });

export const createTeacher = ({ name, email, password }) => axiosClient.post(BASE, { name, email, password });

export const updateUserName = (id, name) => axiosClient.put(`${BASE}/${id}`, { name });

export const setUserLocked = (id, isLocked) => axiosClient.put(`${BASE}/${id}`, { is_locked: isLocked });

export const deleteUser = (id) => axiosClient.delete(`${BASE}/${id}`);
