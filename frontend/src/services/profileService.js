// AI-assisted [AI-06]
// API Hồ sơ và kết quả học tập (HT-07)
import axiosClient from '../api/axiosClient';

export const getProfile = (_params, signal) => axiosClient.get('/api/users/profile', { signal });

export const updateProfileName = (name) => axiosClient.put('/api/users/profile', { name });

export const changePassword = ({ currentPassword, newPassword }) =>
  axiosClient.put('/api/users/password', { currentPassword, newPassword });

// Trả về danh sách khóa học, mỗi khóa có các lượt làm bài và điểm cao nhất
export const getQuizHistory = (_params, signal) => axiosClient.get('/api/users/my-quizzes', { signal });

export const getEnrolledCourses = (_params, signal) => axiosClient.get('/api/users/my-courses', { signal });
