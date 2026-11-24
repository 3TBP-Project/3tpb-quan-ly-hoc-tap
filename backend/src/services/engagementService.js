const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');
const lessonRepository = require('../repositories/lessonRepository');
const engagementRepository = require('../repositories/engagementRepository');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireEnrollment = async (userId, courseId) => {
  if (!await enrollmentRepository.exists(userId, courseId)) {
    throw createHttpError('Bạn cần ghi danh khóa học trước khi sử dụng chức năng này.', 403);
  }
};

const listCourseComments = async (courseId) => {
  if (!await courseRepository.findById(courseId)) {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }
  return engagementRepository.listCourseComments(courseId);
};

const createCourseComment = async (userId, courseId, { rating, content }) => {
  const course = await courseRepository.findById(courseId);
  if (!course || course.status !== 'public') {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }
  await requireEnrollment(userId, courseId);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createHttpError('rating phải là số nguyên từ 1 đến 5.', 400);
  }
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw createHttpError('Nội dung đánh giá không được để trống.', 400);
  }
  const commentId = await engagementRepository.createCourseComment({
    userId,
    courseId,
    rating,
    content: content.trim()
  });
  return { id: Number(commentId), courseId, rating, content: content.trim() };
};

const getEnrolledLessonId = async (userId, lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);
  // Bài nháp, hoặc bài thuộc khóa học nháp / bị ẩn: học viên không được thảo luận
  if (!lesson || lesson.status !== 'public' || lesson.course_status !== 'public') {
    throw createHttpError('Không tìm thấy bài học.', 404);
  }
  await requireEnrollment(userId, lesson.course_id);
  // Học tuần tự: bài còn khóa thì chưa được xem / gửi thảo luận
  if (await lessonRepository.countIncompletePrevious(userId, lesson) > 0) {
    throw createHttpError('Bạn cần hoàn thành các bài học trước để mở khóa bài này.', 403);
  }
  return lesson;
};

const listDiscussions = async (userId, lessonId) => {
  await getEnrolledLessonId(userId, lessonId);
  return engagementRepository.listDiscussions(lessonId);
};

const createDiscussion = async (userId, lessonId, { parentId = null, content }) => {
  await getEnrolledLessonId(userId, lessonId);
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw createHttpError('Nội dung thảo luận không được để trống.', 400);
  }
  if (parentId !== null) {
    const parent = await engagementRepository.findDiscussionById(parentId);
    if (!parent || Number(parent.lesson_id) !== lessonId) {
      throw createHttpError('Không tìm thấy thảo luận cha trong bài học này.', 404);
    }
  }
  const discussionId = await engagementRepository.createDiscussion({
    lessonId,
    userId,
    parentId,
    content: content.trim()
  });
  return { id: Number(discussionId), lessonId, parentId, content: content.trim() };
};

module.exports = { listCourseComments, createCourseComment, listDiscussions, createDiscussion };
