// AI-assisted [AI-06]
import { forceLogoutLocked, isAccountLockedPayload } from '../utils/forceLogout';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const getAuthToken = () => {
  return localStorage.getItem('access_token') || '';
};

const handleApiResponse = async (response) => {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Phản hồi từ máy chủ không hợp lệ.');
  }

  if (response.status === 403 && isAccountLockedPayload(payload)) {
    forceLogoutLocked(payload.message);
  }

  if (!response.ok || payload?.status === 'error') {
    const error = new Error(payload?.message || 'Có lỗi xảy ra khi xử lý bài trắc nghiệm.');
    error.statusCode = response.status;
    throw error;
  }

  return payload.data;
};

/**
 * Gọi API khởi tạo lượt làm bài trắc nghiệm (HT-06)
 * POST /api/quizzes/courses/:courseId/start
 */
export const startQuizApi = async (courseId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/quizzes/courses/${courseId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return handleApiResponse(response);
};

/**
 * Gọi API nộp bài và chấm điểm tự động phía Server (HT-06 & HT-NFR1)
 * POST /api/quizzes/attempts/:attemptId/submit
 */
export const submitQuizApi = async (attemptId, answers) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ answers }),
  });

  return handleApiResponse(response);
};