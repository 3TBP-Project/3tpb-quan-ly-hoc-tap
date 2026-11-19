// AI-assisted [AI-15]
// API Quản lý người dùng (HT-14) – chỉ admin gọi được.
import axiosClient from '../api/axiosClient';

const BASE = '/api/admin/users';

// Trả về { data: { items, counts, pagination } } để dùng được với useFetch
export const getUsers = ({ role, search, page, limit }, signal) =>
  axiosClient
    .get(BASE, { params: { role, search: search || undefined, page, limit }, signal })
    .then((res) => ({
      data: { items: res.data, counts: res.counts, pagination: res.pagination },
    }));

export const getUserById = ({ id }, signal) => axiosClient.get(`${BASE}/${id}`, { signal });

export const createUser = (payload) => axiosClient.post(BASE, payload);

export const updateUser = (id, payload) => axiosClient.put(`${BASE}/${id}`, payload);

export const setUserLocked = (id, locked) => axiosClient.patch(`${BASE}/${id}/lock`, { locked });
