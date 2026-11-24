import axiosClient from '../api/axiosClient';
import { mockCourses } from '../mocks/course';
import { mockGetCategories, mockGetCourses, mockGetTeachers } from '../mocks/courseApi';
import { mockGetCourseById, mockEnroll } from '../mocks/courseDetailApi';
import {
  getSavedEnrolledCourses,
  isCourseEnrolledSaved,
  saveEnrolledCourse,
} from '../utils/enrollmentStorage';
import { withCourseProgress } from '../utils/progress';
import { getCompletedCountMap } from '../utils/progressStorage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const courseMemoryCache = new Map(mockCourses.map((c) => [Number(c.id), c]));

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

export const getCourses = (params, signal) =>
  USE_MOCK
    ? mockGetCourses(params)
    : axiosClient.get('/api/courses', { params: clean(params), signal }).then((response) => ({
        status: response.status,
        data: {
          items: response.data,
          ...response.pagination
        }
      }));

export const getCategories = (_params, signal) =>
  USE_MOCK ? mockGetCategories() : axiosClient.get('/api/categories', { signal });

export const getTeachers = (_params, signal) =>
  USE_MOCK ? mockGetTeachers() : axiosClient.get('/api/teachers', { signal });

// localStorage chỉ dùng để giả lập ghi danh / tiến độ khi chạy dữ liệu giả (VITE_USE_MOCK).
// Khi gọi API thật thì server là nguồn sự thật duy nhất: không trộn dữ liệu cũ trong trình duyệt,
// tránh hiện "đã ghi danh" / khóa học đã bị ẩn / tiến độ sai sau khi dữ liệu trên server thay đổi.
export const getCourseById = async ({ id }, signal) => {
  if (!USE_MOCK) return axiosClient.get(`/api/courses/${id}`, { signal });

  const res = await mockGetCourseById({ id });
  if (res?.data) {
    courseMemoryCache.set(Number(id), res.data);
    res.data.isEnrolled = Boolean(res.data.isEnrolled || isCourseEnrolledSaved(id));
  }
  return res;
};

export const enrollCourse = async (id) => {
  if (!USE_MOCK) return axiosClient.post(`/api/enrollments/courses/${id}`);

  const res = await mockEnroll(id);
  const cached = courseMemoryCache.get(Number(id));
  saveEnrolledCourse(cached || { id: Number(id) });
  return res;
};

export const getMyCourses = async (_params, signal) => {
  if (!USE_MOCK) {
    // Lỗi mạng / server được ném ra để trang hiển thị thông báo lỗi thay vì danh sách cũ
    const res = await axiosClient.get('/api/enrollments/my-courses', { signal });
    const apiList = Array.isArray(res?.data) ? res.data : [];
    return { status: 'success', data: apiList.map((course) => withCourseProgress(course)) };
  }

  const completedMap = getCompletedCountMap();
  const data = getSavedEnrolledCourses().map((course) => {
    const localDone = completedMap.get(Number(course.id)) ?? 0;
    const serverDone = Number(course.completedLessonCount) || 0;
    return withCourseProgress(course, Math.max(serverDone, localDone));
  });
  return { status: 'success', data };
};
