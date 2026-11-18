import axiosClient from '../api/axiosClient';
import { mockGetLearnData, mockCompleteLesson } from '../mocks/lessonApi';

// Giống courseService: mặc định dùng dữ liệu giả, đặt VITE_USE_MOCK=false để gọi backend thật
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const getLearnData = ({ courseId }, signal) =>
  USE_MOCK ? mockGetLearnData({ courseId }) : axiosClient.get(`/api/courses/${courseId}/learn`, { signal });

export const completeLesson = (lessonId) =>
  USE_MOCK ? mockCompleteLesson(lessonId) : axiosClient.post(`/api/lessons/${lessonId}/complete`);