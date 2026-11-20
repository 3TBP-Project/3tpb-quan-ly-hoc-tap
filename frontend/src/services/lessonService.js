// AI-assisted [AI-14]
import axiosClient from '../api/axiosClient';
import { mockGetLearnData, mockCompleteLesson } from '../mocks/lessonApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 1. Lấy dữ liệu bài học & tiến độ cho học viên học bài (HT-05)
export const getLearnData = ({ courseId }, signal) =>
  USE_MOCK ? mockGetLearnData({ courseId }) : axiosClient.get(`/api/courses/${courseId}/learn`, { signal });

// 2. Đánh dấu hoàn thành bài học (HT-05)
export const completeLesson = (lessonId) =>
  USE_MOCK ? mockCompleteLesson(lessonId) : axiosClient.post(`/api/lessons/${lessonId}/complete`);

// 3. Lấy danh sách khóa học của giảng viên
export const getTeacherCourses = async () => {
  try {
    return await axiosClient.get('/api/teacher/courses');
  } catch {
    return await axiosClient.get('/api/courses/my-courses');
  }
};

// 4. Lấy danh sách bài học của một khóa học (HT-10)
export const getCourseLessons = (courseId, signal) =>
  axiosClient.get(`/api/courses/${courseId}/lessons`, { signal });

// 5. Lấy chi tiết một bài học (HT-10)
export const getLesson = (lessonId, signal) =>
  axiosClient.get(`/api/lessons/${lessonId}`, { signal });

// 6. Tạo mới bài học cho khóa học (HT-10)
export const createLesson = (courseId, payload) =>
  axiosClient.post(`/api/courses/${courseId}/lessons`, payload);

// 7. Cập nhật bài học (HT-10)
export const updateLesson = (lessonId, payload) =>
  axiosClient.put(`/api/lessons/${lessonId}`, payload);

// 8. Xóa bài học (HT-10)
export const deleteLesson = (lessonId) =>
  axiosClient.delete(`/api/lessons/${lessonId}`);
