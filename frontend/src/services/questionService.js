// AI-assisted [AI-13]
import axiosClient from '../api/axiosClient';

export const getTeacherCourses = () =>
  axiosClient.get('/api/teacher/courses');

export const getCourseQuestions = (courseId) =>
  axiosClient.get(`/api/teacher/courses/${courseId}/questions`);

export const updateCourseQuizDuration = (courseId, quizDuration) =>
  axiosClient.put(`/api/teacher/courses/${courseId}/quiz-duration`, { quizDuration });

export const createCourseQuestion = (courseId, payload) =>
  axiosClient.post(`/api/teacher/courses/${courseId}/questions`, payload);

export const updateCourseQuestion = (courseId, questionId, payload) =>
  axiosClient.put(`/api/teacher/courses/${courseId}/questions/${questionId}`, payload);

export const deleteCourseQuestion = (courseId, questionId) =>
  axiosClient.delete(`/api/teacher/courses/${courseId}/questions/${questionId}`);