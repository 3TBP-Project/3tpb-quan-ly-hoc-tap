// AI-assisted [AI-07]
// API Danh mục và duyệt khóa học (HT-15) – chỉ quản trị viên gọi được
import axiosClient from '../api/axiosClient';

export const getAdminCategories = (_params, signal) => axiosClient.get('/api/admin/categories', { signal });

export const createCategory = (name) => axiosClient.post('/api/admin/categories', { name });

export const updateCategory = (id, name) => axiosClient.put(`/api/admin/categories/${id}`, { name });

export const deleteCategory = (id) => axiosClient.delete(`/api/admin/categories/${id}`);

export const getAdminCourses = (_params, signal) => axiosClient.get('/api/admin/courses', { signal });

export const hideCourse = (id) => axiosClient.patch(`/api/admin/courses/${id}/hide`);

export const unhideCourse = (id) => axiosClient.patch(`/api/admin/courses/${id}/unhide`);
