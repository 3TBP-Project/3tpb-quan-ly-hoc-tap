// AI-assisted [AI-09]
import { mockCourses } from './course';

const delay = (value, ms = 250) => new Promise((r) => setTimeout(() => r(value), ms));
const enrolledIds = new Set(); // giả lập "đã ghi danh" trong phiên chạy

export function mockGetCourseById({ id }) {
  const course = mockCourses.find((c) => c.id === Number(id));
  if (!course) {
    // Cùng hình dạng lỗi axios mà parseApiError đang đọc
    return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy khóa học' } } });
  }
  const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
    id: course.id * 100 + i + 1,
    order: i + 1,
    title: `Bài ${i + 1}: Nội dung bài học ${i + 1}`,
  }));
  return delay({
    status: 'success',
    data: {
      ...course,
      description: 'Mô tả khóa học (dữ liệu giả).',
      studentCount: 20 + course.id,
      lessons,
      isEnrolled: enrolledIds.has(course.id),
    },
  });
}

export function mockEnroll(id) {
  enrolledIds.add(Number(id));
  return delay({ status: 'success', message: 'Ghi danh thành công' });
}

export function mockGetMyCourses() {
  const courses = mockCourses.filter((course) => enrolledIds.has(course.id));
  return delay({ status: 'success', data: courses });
}