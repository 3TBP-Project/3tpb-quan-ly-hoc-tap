// AI-assisted [AI-13]
// Giả lập API trang học bài (HT-05) cho tới khi backend có route bài học và tiến độ.
import { mockCourses } from './course';
// import { buildLessons, isMockEnrolled } from './courseDetailApi';

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

  return delay({
    status: 'success',
    data: {
      course: { id: course.id, title: course.title },
      lessons,
      completedLessonIds: lessons.filter((l) => completedIds.has(l.id)).map((l) => l.id),
    },
  });
}

export function mockCompleteLesson(lessonId) {
  completedIds.add(Number(lessonId));
  return delay({ status: 'success', message: 'Đã đánh dấu hoàn thành' });
}
