// AI-assisted [AI-13]
// Giả lập API trang học bài (HT-05) cho tới khi backend có route bài học và tiến độ.
import { mockCourses } from './course';
import { buildLessons, isMockEnrolled } from './courseDetailApi';
import {
  getCompletedLessonIds,
  saveCompletedLesson,
  setCompletedLessons,
} from '../utils/progressStorage';

// Dán link YouTube bài giảng thật vào đây để thử phần video nhúng
const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=VIDEO_ID';

const delay = (value, ms = 250) => new Promise((r) => setTimeout(() => r(value), ms));
// Cùng hình dạng lỗi axios mà parseApiError và useFetch đang đọc
const fail = (status, message) => Promise.reject({ response: { status, data: { message } } });
const completedIds = new Set(); // Set không trùng, giống unique(user_id, lesson_id)

export function mockGetLearnData({ courseId }) {
  const course = mockCourses.find((c) => c.id === Number(courseId));
  if (!course) return fail(404, 'Không tìm thấy khóa học');
  if (!isMockEnrolled(course.id)) return fail(403, 'Bạn chưa ghi danh khóa học này');

  const lessons = buildLessons(course).map((l, i) => ({
    ...l,
    content: `${l.title}\nNội dung bài học (dữ liệu giả).`,
    videoUrl: SAMPLE_VIDEO,
    fileUrl: i % 2 === 0 ? '/files/sample.pdf' : null,
  }));

  // [HT-04] Gộp tiến độ trong phiên + tiến độ đã lưu localStorage để F5 không mất %
  const savedIds = getCompletedLessonIds(course.id);
  const mergedIds = lessons
    .filter((l) => completedIds.has(l.id) || savedIds.includes(l.id))
    .map((l) => l.id);
  setCompletedLessons(course.id, mergedIds);

  return delay({
    status: 'success',
    data: {
      course: { id: course.id, title: course.title },
      lessons,
      completedLessonIds: mergedIds,
    },
  });
}

export function mockCompleteLesson(lessonId) {
  const id = Number(lessonId);
  completedIds.add(id);
  // [HT-04] Tìm khóa chứa bài học để lưu tiến độ xuống localStorage
  const course = mockCourses.find(
    (c) => id >= c.id * 100 + 1 && id <= c.id * 100 + c.lessonCount
  );
  if (course) saveCompletedLesson(course.id, id);
  return delay({ status: 'success', message: 'Đã đánh dấu hoàn thành' });
}
