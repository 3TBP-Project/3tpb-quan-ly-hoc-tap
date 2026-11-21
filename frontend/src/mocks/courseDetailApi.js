// AI-assisted [AI-09]
import { mockCourses } from './course';
import { isCourseEnrolledSaved } from '../utils/enrollmentStorage';

const delay = (value, ms = 250) => new Promise((r) => setTimeout(() => r(value), ms));
const enrolledIds = new Set(); // giả lập "đã ghi danh" trong phiên chạy

// [HT-05] Dựng danh sách bài học giả dùng chung cho trang học bài
export function buildLessons(course) {
  const total = Number(course?.lessonCount) || 0;
  return Array.from({ length: total }, (_, i) => ({
    id: Number(course.id) * 100 + i + 1,
    order: i + 1,
    title: `Bài ${i + 1}: Nội dung bài học ${i + 1}`,
  }));
}

// [HT-05] Kiểm tra ghi danh ở tầng mock (phiên chạy + localStorage để F5 không mất)
export function isMockEnrolled(courseId) {
  const id = Number(courseId);
  if (enrolledIds.has(id)) return true;
  try {
    return isCourseEnrolledSaved(id);
  } catch {
    return false;
  }
}

export function mockGetCourseById({ id }) {
  const course = mockCourses.find((c) => c.id === Number(id));
  if (!course) {
    // Cùng hình dạng lỗi axios mà parseApiError đang đọc
    return Promise.reject({ response: { status: 404, data: { message: 'Không tìm thấy khóa học' } } });
  }
  const lessons = buildLessons(course);
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

// Dùng chung cho trang chi tiết (HT-02) và trang học (HT-05) để cùng một danh sách bài
export function buildLessons(course) {
  return Array.from({ length: course.lessonCount }, (_, i) => ({
    id: course.id * 100 + i + 1,
    order: i + 1,
    title: `Bài ${i + 1}: Nội dung bài học ${i + 1}`,
  }));
}

export const isMockEnrolled = (id) => enrolledIds.has(Number(id));
