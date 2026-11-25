// AI-assisted [AI-14]
import axiosClient from '../api/axiosClient';
import { mockGetLearnData, mockCompleteLesson } from '../mocks/lessonApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// 1. Lấy dữ liệu bài học & tiến độ cho học viên học bài (HT-05)
export const getLearnData = ({ courseId }, signal) =>
  USE_MOCK ? mockGetLearnData({ courseId }) : axiosClient.get(`/api/courses/${courseId}/learn`, { signal });

// 2. Đánh dấu hoàn thành bài học (HT-05)
export const completeLesson = (lessonId) =>
  USE_MOCK ? mockCompleteLesson(lessonId) : axiosClient.post(`/api/lessons/${lessonId}/complete`);

// 3. Lấy danh sách khóa học của giảng viên
export const getTeacherCourses = async () => {
  try {
    const res = await axiosClient.get('/api/teacher/courses');
    return { status: 'success', data: Array.isArray(res?.data) ? res.data : [] };
  } catch {
    const res = await axiosClient.get('/api/courses/my-courses');
    return {
      status: 'success',
      data: Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []),
    };
  }
};

// 3b. Giảng viên tạo khóa học mới (HT-09)
export const createCourse = (payload) => axiosClient.post('/api/courses', payload);

// Danh mục cho form tạo khóa học (luôn gọi API thật, không qua mock)
export const getCourseCategories = (signal) => axiosClient.get('/api/categories', { signal });

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

// 7b. Tải tệp PDF cho bài học (multipart, tối đa 5 MB)
export const uploadLessonFile = (lessonId, file) => {
  const formData = new FormData();
  formData.append('pdf_file', file);
  return axiosClient.post(`/api/lessons/${lessonId}/file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

// 7c. Tải tài liệu PDF về (có kèm token nên phải gọi qua axios rồi mở blob)
export const downloadLessonFile = async (lessonId, fileName = 'tai-lieu.pdf') => {
  const blob = await axiosClient.get(`/api/lessons/${lessonId}/file`, {
    responseType: 'blob',
    timeout: 60000,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// 7c2. Đổi trạng thái bài học: 'draft' (nháp) hoặc 'public' (công khai)
export const updateLessonStatus = (lessonId, status) =>
  axiosClient.patch(`/api/lessons/${lessonId}/status`, { status });

// 7d. Đổi chỗ hai bài học (nút lên / xuống)
export const swapLessons = (lessonId, targetLessonId) =>
  axiosClient.post(`/api/lessons/${lessonId}/swap`, { targetLessonId });

// 7e. Đổi trạng thái khóa học: 'draft' (nháp) hoặc 'public' (công khai)
export const updateCourseStatus = (courseId, status) =>
  axiosClient.put(`/api/courses/${courseId}`, { status });

// 7f. Giảng viên sửa thông tin khóa học: tên, danh mục, mô tả (HT-09)
export const updateCourse = (courseId, payload) =>
  axiosClient.put(`/api/courses/${courseId}`, payload);

// 7g. Tải lên / thay ảnh bìa khóa học (multipart, JPG/PNG/WEBP tối đa 2 MB)
export const uploadCourseThumbnail = (courseId, file) => {
  const formData = new FormData();
  formData.append('thumbnail', file);
  return axiosClient.patch(`/api/courses/${courseId}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
};

// 7h. Xóa ảnh bìa khóa học (quay về ảnh bìa mặc định theo danh mục)
export const deleteCourseThumbnail = (courseId) =>
  axiosClient.delete(`/api/courses/${courseId}/thumbnail`);

// 7i. Xóa khóa học (xóa luôn bài học, chương và ảnh bìa)
export const deleteCourse = (courseId) =>
  axiosClient.delete(`/api/courses/${courseId}`);

// 8. Xóa bài học (HT-10)
export const deleteLesson = (lessonId) =>
  axiosClient.delete(`/api/lessons/${lessonId}`);

// 9. Chương học (giảng viên sở hữu khóa học / admin)
export const getCourseChapters = (courseId, signal) =>
  axiosClient.get(`/api/courses/${courseId}/chapters`, { signal });

export const createChapter = (courseId, title) =>
  axiosClient.post(`/api/courses/${courseId}/chapters`, { title });

export const renameChapter = (chapterId, title) =>
  axiosClient.put(`/api/chapters/${chapterId}`, { title });

export const swapChapters = (chapterId, targetChapterId) =>
  axiosClient.post(`/api/chapters/${chapterId}/swap`, { targetChapterId });

// Xóa chương: các bài học trong chương được giữ lại, chuyển sang "chưa phân chương"
export const deleteChapter = (chapterId) =>
  axiosClient.delete(`/api/chapters/${chapterId}`);
