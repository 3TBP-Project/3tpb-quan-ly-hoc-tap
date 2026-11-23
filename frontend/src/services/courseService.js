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

export const getCourseById = async ({ id }, signal) => {
  const res = USE_MOCK
    ? await mockGetCourseById({ id })
    : await axiosClient.get(`/api/courses/${id}`, { signal });

  if (res?.data) {
    courseMemoryCache.set(Number(id), res.data);
    res.data.isEnrolled = Boolean(res.data.isEnrolled || isCourseEnrolledSaved(id));
  }
  return res;
};

export const enrollCourse = async (id) => {
  const res = USE_MOCK
    ? await mockEnroll(id)
    : await axiosClient.post(`/api/enrollments/courses/${id}`);

  const cached = courseMemoryCache.get(Number(id));
  saveEnrolledCourse(cached || { id: Number(id) });
  return res;
};

export const getMyCourses = async (_params, signal) => {
  const savedLocal = getSavedEnrolledCourses();
  const completedMap = getCompletedCountMap();

  const applyLocalProgress = (course) => {
    const localDone = completedMap.get(Number(course.id)) ?? 0;
    const serverDone = Number(course.completedLessonCount) || 0;
    const mergedDone = Math.max(serverDone, localDone);
    return withCourseProgress(course, mergedDone);
  };

  if (USE_MOCK) {
    const data = savedLocal.map(applyLocalProgress);
    return { status: 'success', data };
  }

  try {
    const res = await axiosClient.get('/api/enrollments/my-courses', { signal });
    const apiList = Array.isArray(res?.data) ? res.data : [];

    // Ưu tiên dữ liệu mới nhất từ API ghi đè lên bản lưu cũ trong localStorage
    const mergedMap = new Map();
    [...savedLocal, ...apiList].forEach((c) => {
      if (c && c.id != null) {
        const cid = Number(c.id);
        const prev = mergedMap.get(cid);
        const merged = prev ? { ...prev, ...c } : c;
        mergedMap.set(cid, applyLocalProgress(merged));
      }
    });

    return { status: 'success', data: Array.from(mergedMap.values()) };
  } catch (err) {
    // Nếu request bị hủy khi unmount thì ném lại cho useFetch xử lý
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') throw err;
    // Nếu backend lỗi/mất kết nối khi F5, vẫn hiển thị danh sách đã lưu ở client
    return { status: 'success', data: savedLocal.map(applyLocalProgress) };
  }
};
