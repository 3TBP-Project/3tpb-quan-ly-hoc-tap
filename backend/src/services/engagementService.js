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
  if (!await courseRepository.findById(courseId)) {
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
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
  await requireEnrollment(userId, lesson.course_id);
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
