// AI-assisted [AI-06]
// API Hồ sơ và kết quả học tập (HT-07)
import axiosClient from '../api/axiosClient';

export const getProfile = (_params, signal) => axiosClient.get('/api/users/profile', { signal });

export const updateProfileName = (name) => axiosClient.put('/api/users/profile', { name });

// Gửi multipart/form-data; trình duyệt tự thêm boundary
export const updateAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return axiosClient.patch('/api/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// "/uploads/avatars/x.webp" -> "http://localhost:5000/uploads/avatars/x.webp"
export const toAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return `${base}${avatar}`;
};

export const changePassword =({ currentPassword, newPassword }) =>
  axiosClient.put('/api/users/password', { currentPassword, newPassword });

// Trả về danh sách khóa học, mỗi khóa có các lượt làm bài và điểm cao nhất
export const getQuizHistory = (_params, signal) => axiosClient.get('/api/users/my-quizzes', { signal });

export const getEnrolledCourses = (_params, signal) => axiosClient.get('/api/users/my-courses', { signal });

export const getTeacherCourses = async (_params, signal) => {
  const response = await axiosClient.get('/api/courses/my-courses', { signal });
  return { status: 'success', data: Array.isArray(response.data) ? response.data : [] };
};
