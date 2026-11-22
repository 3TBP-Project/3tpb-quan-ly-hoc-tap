const enrollmentRepository = require('../repositories/enrollmentRepository');
const lessonRepository = require('../repositories/lessonRepository');
const courseRepository = require('../repositories/courseRepository');
const fs = require('fs');
const path = require('path');
const { PRIVATE_PDF_DIR } = require('../middlewares/pdfUploadMiddleware');

// Tên tệp do pdfUploadMiddleware sinh ra: <timestamp>-<24 ký tự hex>.pdf
const STORED_PDF_NAME = /^\d+-[a-f0-9]{24}\.pdf$/;

const resolveStoredPdf = (fileName) =>
  typeof fileName === 'string' && STORED_PDF_NAME.test(fileName)
    ? path.join(PRIVATE_PDF_DIR, fileName)
    : null;

const removeStoredPdf = async (fileName) => {
  const fullPath = resolveStoredPdf(fileName);
  if (!fullPath) return;
  try {
    await fs.promises.unlink(fullPath);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Không xóa được tệp PDF cũ:', error);
  }
};

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getLearnData = async (userId, courseId) => {
  const course = await lessonRepository.findCourseById(courseId);
  if (!course) {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }

  const isEnrolled = await enrollmentRepository.exists(userId, courseId);
  if (!isEnrolled) {
    throw createHttpError('Bạn cần ghi danh khóa học trước khi vào học.', 403);
  }

  const lessons = await lessonRepository.findByCourseIdWithProgress(courseId, userId);
  return {
    course: { id: Number(course.id), title: course.title },
    lessons,
    completedLessonIds: lessons.filter((lesson) => lesson.isCompleted).map((lesson) => lesson.id)
  };
};

const completeLesson = async (userId, lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw createHttpError('Không tìm thấy bài học.', 404);
  }

  const isEnrolled = await enrollmentRepository.exists(userId, lesson.course_id);
  if (!isEnrolled) {
    throw createHttpError('Bạn cần ghi danh khóa học trước khi cập nhật tiến độ.', 403);
  }

  await lessonRepository.markCompleted(userId, lessonId);
  return { lessonId: Number(lessonId), completed: true };
};

const getCourseLessons = async (courseId, userId, role) => {
  await requireCourseManager(courseId, userId, role);
  return lessonRepository.findSummariesByCourseId(courseId);
};

const getLesson = async (userId, lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);

  const isEnrolled = await enrollmentRepository.exists(userId, lesson.course_id);
  if (!isEnrolled) {
    throw createHttpError('Bạn cần ghi danh khóa học trước khi xem bài học.', 403);
  }

  return {
    id: Number(lesson.id),
    courseId: Number(lesson.course_id),
    title: lesson.title,
    content: lesson.content,
    video_path: lesson.video_path,
    file_path: lesson.file_path,
    position: Number(lesson.position)
  };
};

const requireCourseManager = async (courseId, userId, role) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw createHttpError('Không tìm thấy khóa học.', 404);
  if (role !== 'admin' && Number(course.user_id) !== Number(userId)) {
    throw createHttpError('Bạn không có quyền quản lý khóa học này.', 403);
  }
};

const normalizeLessonInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createHttpError('Dữ liệu bài học không hợp lệ.', 400);
  }
  const allowedFields = [
    'title', 'content', 'videoPath', 'filePath', 'video_path', 'file_path', 'position'
  ];
  if (Object.keys(data).some((field) => !allowedFields.includes(field))) {
    throw createHttpError('Dữ liệu bài học chứa trường không được phép.', 400);
  }
  if (data.videoPath !== undefined && data.video_path !== undefined &&
      data.videoPath !== data.video_path) {
    throw createHttpError('Chỉ gửi một trong hai trường videoPath hoặc video_path.', 400);
  }
  if (data.filePath !== undefined && data.file_path !== undefined &&
      data.filePath !== data.file_path) {
    throw createHttpError('Chỉ gửi một trong hai trường filePath hoặc file_path.', 400);
  }
  return {
    ...data,
    videoPath: data.videoPath !== undefined ? data.videoPath : data.video_path,
    filePath: data.filePath !== undefined ? data.filePath : data.file_path
  };
};

const validateLesson = (data) => {
  if (typeof data.title !== 'string' || data.title.trim().length === 0 || data.title.length > 255) {
    throw createHttpError('Tiêu đề bài học phải từ 1 đến 255 ký tự.', 400);
  }
  if (data.content !== undefined && data.content !== null && typeof data.content !== 'string') {
    throw createHttpError('Nội dung bài học phải là chuỗi.', 400);
  }
  for (const field of ['videoPath', 'filePath']) {
    if (data[field] !== undefined && data[field] !== null &&
      (typeof data[field] !== 'string' || data[field].length > 255)) {
      throw createHttpError(`${field} phải là chuỗi tối đa 255 ký tự.`, 400);
    }
  }
  if (data.position !== undefined &&
    (!Number.isSafeInteger(data.position) || data.position < 1 || data.position > 2147483647)) {
    throw createHttpError('position phải là số nguyên dương.', 400);
  }
};

const assertPositionFree = async (courseId, position, excludeLessonId = null) => {
  const existing = await lessonRepository.findByPosition(courseId, position, excludeLessonId);
  if (existing) {
    throw createHttpError(
      `Vị trí ${position} đã có bài học "${existing.title}". Vui lòng chọn vị trí khác.`,
      409
    );
  }
};

const createLesson = async (courseId, userId, role, data) => {
  await requireCourseManager(courseId, userId, role);
  const normalized = normalizeLessonInput(data);
  validateLesson(normalized);
  if (normalized.filePath != null) {
    throw createHttpError('Tệp PDF phải được tải lên bằng chức năng chọn tệp.', 400);
  }
  const position = normalized.position ?? (await lessonRepository.findMaxPosition(courseId)) + 1;
  await assertPositionFree(courseId, position);
  const lessonId = await lessonRepository.create({
    courseId,
    title: normalized.title.trim(),
    content: normalized.content ?? null,
    videoPath: normalized.videoPath ?? null,
    filePath: null,
    position
  });
  return lessonRepository.findById(lessonId);
};

const updateLesson = async (lessonId, userId, role, updates) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
  await requireCourseManager(lesson.course_id, userId, role);
  if (!updates || typeof updates !== 'object' || Array.isArray(updates) ||
      Object.keys(updates).length === 0) {
    throw createHttpError('Cần gửi ít nhất một trường để cập nhật.', 400);
  }
  const normalizedUpdates = normalizeLessonInput(updates);

  const merged = {
    title: normalizedUpdates.title !== undefined ? normalizedUpdates.title : lesson.title,
    content: normalizedUpdates.content !== undefined ? normalizedUpdates.content : lesson.content,
    videoPath: normalizedUpdates.videoPath !== undefined ? normalizedUpdates.videoPath : lesson.video_path,
    filePath: normalizedUpdates.filePath !== undefined ? normalizedUpdates.filePath : lesson.file_path,
    position: normalizedUpdates.position !== undefined ? normalizedUpdates.position : lesson.position
  };
  validateLesson(merged);
  // file_path chỉ được giữ nguyên hoặc xóa (null); tệp mới phải đi qua API tải lên
  if (merged.filePath != null && merged.filePath !== lesson.file_path) {
    throw createHttpError('Tệp PDF phải được tải lên bằng chức năng chọn tệp.', 400);
  }
  if (Number(merged.position) !== Number(lesson.position)) {
    await assertPositionFree(lesson.course_id, merged.position, lessonId);
  }
  await lessonRepository.update(lessonId, {
    ...merged,
    title: merged.title.trim()
  });
  if (lesson.file_path && merged.filePath == null) {
    await removeStoredPdf(lesson.file_path);
  }
  return lessonRepository.findById(lessonId);
};

const deleteLesson = async (lessonId, userId, role) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
  await requireCourseManager(lesson.course_id, userId, role);
  await lessonRepository.remove(lessonId);
  await removeStoredPdf(lesson.file_path);
};

// HT-10: giảng viên tải tệp PDF cho bài học (tệp đã được pdfUploadMiddleware lưu tạm)
const uploadLessonFile = async (lessonId, userId, role, file) => {
  if (!file) throw createHttpError('Vui lòng chọn tệp PDF.', 400);
  try {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
    await requireCourseManager(lesson.course_id, userId, role);

    // Không tin mimetype do trình duyệt gửi: kiểm tra chữ ký "%PDF-" ở đầu tệp
    const handle = await fs.promises.open(file.path, 'r');
    const header = Buffer.alloc(5);
    try {
      await handle.read(header, 0, 5, 0);
    } finally {
      await handle.close();
    }
    if (header.toString('ascii') !== '%PDF-') {
      throw createHttpError('Tệp tải lên không phải PDF hợp lệ.', 400);
    }

    await lessonRepository.updateFilePath(lessonId, file.filename);
    if (lesson.file_path && lesson.file_path !== file.filename) {
      await removeStoredPdf(lesson.file_path);
    }
    return lessonRepository.findById(lessonId);
  } catch (error) {
    await removeStoredPdf(file.filename);
    throw error;
  }
};

// Học viên đã ghi danh, giảng viên sở hữu khóa học hoặc admin mới tải được tệp
const getLessonFile = async (lessonId, userId, role) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);

  if (role === 'student') {
    const isEnrolled = await enrollmentRepository.exists(userId, lesson.course_id);
    if (!isEnrolled) {
      throw createHttpError('Bạn cần ghi danh khóa học trước khi tải tài liệu.', 403);
    }
  } else {
    await requireCourseManager(lesson.course_id, userId, role);
  }

  const fullPath = resolveStoredPdf(lesson.file_path);
  if (!fullPath || !fs.existsSync(fullPath)) {
    throw createHttpError('Bài học này chưa có tệp PDF.', 404);
  }
  const safeTitle = String(lesson.title).replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim() || 'tai-lieu';
  return { fullPath, downloadName: `${safeTitle}.pdf` };
};

// Đổi chỗ hai bài học cùng khóa (nút lên / xuống)
const swapLessons = async (lessonId, targetLessonId, userId, role) => {
  if (lessonId === targetLessonId) {
    throw createHttpError('Không thể đổi chỗ bài học với chính nó.', 400);
  }
  const [lesson, target] = await Promise.all([
    lessonRepository.findById(lessonId),
    lessonRepository.findById(targetLessonId)
  ]);
  if (!lesson || !target) throw createHttpError('Không tìm thấy bài học.', 404);
  if (Number(lesson.course_id) !== Number(target.course_id)) {
    throw createHttpError('Hai bài học không thuộc cùng một khóa học.', 400);
  }
  await requireCourseManager(lesson.course_id, userId, role);
  await lessonRepository.swapPositions(lesson, target);
};

module.exports = {
  getLearnData,
  completeLesson,
  getCourseLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonFile,
  getLessonFile,
  swapLessons
};
