// AI-assisted
// Quản lý chương học: chỉ giảng viên sở hữu khóa học hoặc admin được thêm / sửa / xóa.
const courseRepository = require('../repositories/courseRepository');
const chapterRepository = require('../repositories/chapterRepository');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireCourseManager = async (courseId, userId, role) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw createHttpError('Không tìm thấy khóa học.', 404);
  if (role !== 'admin' && Number(course.user_id) !== Number(userId)) {
    throw createHttpError('Bạn không có quyền quản lý khóa học này.', 403);
  }
};

const findChapterOrThrow = async (chapterId) => {
  const chapter = await chapterRepository.findById(chapterId);
  if (!chapter) throw createHttpError('Không tìm thấy chương học.', 404);
  return chapter;
};

const normalizeTitle = (title) => {
  if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 255) {
    throw createHttpError('Tên chương phải từ 1 đến 255 ký tự.', 400);
  }
  return title.trim();
};

const listChapters = async (courseId, userId, role) => {
  await requireCourseManager(courseId, userId, role);
  return chapterRepository.findByCourseId(courseId);
};

// Chương mới luôn được thêm vào cuối khóa học
const createChapter = async (courseId, userId, role, data) => {
  await requireCourseManager(courseId, userId, role);
  const title = normalizeTitle(data?.title);
  const position = (await chapterRepository.findMaxPosition(courseId)) + 1;
  const chapterId = await chapterRepository.create({ courseId, title, position });
  return chapterRepository.findById(chapterId);
};

const renameChapter = async (chapterId, userId, role, data) => {
  const chapter = await findChapterOrThrow(chapterId);
  await requireCourseManager(chapter.courseId, userId, role);
  const title = normalizeTitle(data?.title);
  await chapterRepository.update(chapterId, { title, position: chapter.position });
  return chapterRepository.findById(chapterId);
};

// Đổi chỗ hai chương cùng khóa (nút lên / xuống)
const swapChapters = async (chapterId, targetChapterId, userId, role) => {
  if (chapterId === targetChapterId) {
    throw createHttpError('Không thể đổi chỗ chương với chính nó.', 400);
  }
  const [chapter, target] = await Promise.all([
    findChapterOrThrow(chapterId),
    findChapterOrThrow(targetChapterId)
  ]);
  if (chapter.courseId !== target.courseId) {
    throw createHttpError('Hai chương không thuộc cùng một khóa học.', 400);
  }
  await requireCourseManager(chapter.courseId, userId, role);
  await chapterRepository.swapPositions(chapter, target);
};

// Xóa chương nhưng giữ lại bài học: các bài chuyển sang nhóm "chưa có chương"
const deleteChapter = async (chapterId, userId, role) => {
  const chapter = await findChapterOrThrow(chapterId);
  await requireCourseManager(chapter.courseId, userId, role);
  const detachedLessons = await chapterRepository.removeKeepingLessons(chapterId);
  return { detachedLessons };
};

module.exports = {
  listChapters,
  createChapter,
  renameChapter,
  swapChapters,
  deleteChapter
};
