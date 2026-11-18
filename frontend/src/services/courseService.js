import axiosClient from '../api/axiosClient';
import { mockGetCategories, mockGetCourses, mockGetTeachers } from '../mocks/courseApi';
import { mockGetCourseById, mockEnroll } from '../mocks/courseDetailApi';

// TẠM THỜI dùng dữ liệu giả cho tới khi backend có /api/courses.
// Khi API sẵn sàng: đặt VITE_USE_MOCK=false trong .env (và đổi mặc định bên dưới trước khi nộp).
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Bỏ các tham số rỗng để không gửi ?search=&categoryId=
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

// params: { search, categoryId, teacherId, page, limit }
export const getCourses = (params, signal) =>
  USE_MOCK
    ? mockGetCourses(params)
    : axiosClient.get('/api/courses', { params: clean(params), signal });

export const getCategories = (_params, signal) =>
  USE_MOCK ? mockGetCategories() : axiosClient.get('/api/categories', { signal });

export const getTeachers = (_params, signal) =>
  USE_MOCK ? mockGetTeachers() : axiosClient.get('/api/teachers', { signal });

export const getCourseById = ({ id }, signal) =>
  USE_MOCK ? mockGetCourseById({ id }) : axiosClient.get(`/api/courses/${id}`, { signal });

export const enrollCourse = (id) =>
  USE_MOCK ? mockEnroll(id) : axiosClient.post(`/api/courses/${id}/enroll`);
