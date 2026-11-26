const enrollmentRepository = require('../repositories/enrollmentRepository');
const lessonRepository = require('../repositories/lessonRepository');
const courseRepository = require('../repositories/courseRepository');
const chapterRepository = require('../repositories/chapterRepository');
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

// HT-10: trạng thái bài học. Bản nháp (draft) chỉ giảng viên/admin thấy,
// công khai (public) mới hiển thị cho học viên.
const LESSON_STATUSES = ['draft', 'public'];

// Khóa học bản nháp (draft) hoặc bị ẩn (hidden) thì học viên không được vào học nữa,
// kể cả khi đã ghi danh từ trước.
const COURSE_UNAVAILABLE_MESSAGE = 'Khóa học hiện không còn công khai nên bạn không thể vào học.';

const assertCourseOpenForStudent = (courseStatus) => {
  if (courseStatus !== 'public') throw createHttpError(COURSE_UNAVAILABLE_MESSAGE, 404);
};

// Học viên không được truy cập bài nháp hoặc bài của khóa học chưa công khai:
// trả 404 để không lộ sự tồn tại của bài
const assertLessonVisibleToStudent = (lesson) => {
  assertCourseOpenForStudent(lesson.course_status);
  if (lesson.status !== 'public') throw createHttpError('Không tìm thấy bài học.', 404);
};

// Học tuần tự (giống F8): phải hoàn thành hết các bài trước mới mở được bài này
const LESSON_LOCKED_MESSAGE = 'Bạn cần hoàn thành các bài học trước để mở khóa bài này.';

const assertLessonUnlocked = async (userId, lesson) => {
  if (await lessonRepository.countIncompletePrevious(userId, lesson) > 0) {
    throw createHttpError(LESSON_LOCKED_MESSAGE, 403);
  }
};

// Bài đầu tiên chưa hoàn thành và mọi bài trước nó được mở; các bài sau bị khóa
// và không gửi nội dung (video, văn bản, tệp) về trình duyệt.
const applySequentialLock = (lessons) => {
  const firstIncomplete = lessons.findIndex((lesson) => !lesson.isCompleted);
  return lessons.map((lesson, index) => {
    const isLocked = firstIncomplete !== -1 && index > firstIncomplete;
    return isLocked
      ? { ...lesson, isLocked, content: null, videoUrl: null, fileUrl: null }
      : { ...lesson, isLocked };
  });
};

const getLearnData = async (userId, courseId) => {
  const course = await lessonRepository.findCourseById(courseId);
  if (!course) {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }
  assertCourseOpenForStudent(course.status);

  const isEnrolled = await enrollmentRepository.exists(userId, courseId);
  if (!isEnrolled) {
    throw createHttpError('Bạn cần ghi danh khóa học trước khi vào học.', 403);
  }

  const [lessonRows, chapters] = await Promise.all([
    lessonRepository.findByCourseIdWithProgress(courseId, userId),
    chapterRepository.findByCourseId(courseId)
  ]);
  const lessons = applySequentialLock(lessonRows);
  return {
    course: { id: Number(course.id), title: course.title },
    // Danh sách chương để giao diện nhóm bài học (lessons đã xếp theo chương rồi tới bài)
    chapters,
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
  assertLessonVisibleToStudent(lesson);
  await assertLessonUnlocked(userId, lesson);

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
  assertLessonVisibleToStudent(lesson);
  await assertLessonUnlocked(userId, lesson);

  return {
    id: Number(lesson.id),
    courseId: Number(lesson.course_id),
    title: lesson.title,
    content: lesson.content,
    video_path: lesson.video_path,
    file_path: lesson.file_path,
    position: Number(lesson.position),
    chapterId: lesson.chapter_id == null ? null : Number(lesson.chapter_id),
    status: lesson.status
  };
};

const requireCourseManager = async (courseId, userId, role) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw createHttpError('Không tìm thấy khóa học.', 404);
  if (role !== 'admin' && Number(course.user_id) !== Number(userId)) {
    throw createHttpError('Bạn không có quyền quản lý khóa học này.', 403);
  }
  return course;
};

// Gỡ bài công khai cuối cùng sẽ tự đưa khóa học về bản nháp (setDraftIfNoPublicLessons).
// Khóa học công khai đang có học viên theo học thì không được về bản nháp,
// nên phải giữ lại ít nhất một bài học công khai.
const assertKeepsPublicLessonForStudents = async (course, lesson) => {
  if (lesson.status !== 'public' || course?.status !== 'public') return;
  const publicLessonCount = await courseRepository.countPublicLessons(lesson.course_id);
  if (publicLessonCount > 1) return;
  const studentCount = await courseRepository.countEnrollments(lesson.course_id);
  if (studentCount > 0) {
    throw createHttpError(
      `Khóa học đang có ${studentCount} học viên theo học nên cần giữ ít nhất một bài học công khai.`,
      409
    );
  }
};

const normalizeLessonInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createHttpError('Dữ liệu bài học không hợp lệ.', 400);
  }
  const allowedFields = [
    'title', 'content', 'videoPath', 'filePath', 'video_path', 'file_path', 'position', 'status',
    'chapterId', 'chapter_id'
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
  if (data.chapterId !== undefined && data.chapter_id !== undefined &&
      data.chapterId !== data.chapter_id) {
    throw createHttpError('Chỉ gửi một trong hai trường chapterId hoặc chapter_id.', 400);
  }
  const videoPath = data.videoPath !== undefined ? data.videoPath : data.video_path;
  const filePath = data.filePath !== undefined ? data.filePath : data.file_path;
  const rawChapterId = data.chapterId !== undefined ? data.chapterId : data.chapter_id;
  return {
    ...data,
    // '' hoặc null = bài học không thuộc chương nào
    chapterId: rawChapterId === '' || rawChapterId === null
      ? null
      : typeof rawChapterId === 'string' && /^\d+$/.test(rawChapterId)
        ? Number(rawChapterId)
        : rawChapterId,
    content: data.content === '' ? null : data.content,
    videoPath: videoPath === '' ? null : videoPath,
    filePath: filePath === '' ? null : filePath,
    position: typeof data.position === 'string' && data.position.trim() !== ''
      ? Number(data.position)
      : data.position
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
  if (data.status !== undefined && !LESSON_STATUSES.includes(data.status)) {
    throw createHttpError('Trạng thái bài học chỉ được là "draft" hoặc "public".', 400);
  }
  if (data.chapterId !== undefined && data.chapterId !== null &&
    (!Number.isSafeInteger(data.chapterId) || data.chapterId < 1)) {
    throw createHttpError('chapterId phải là số nguyên dương hoặc null.', 400);
  }
};

// Chương được chọn phải tồn tại và thuộc đúng khóa học của bài
const assertChapterInCourse = async (chapterId, courseId) => {
  if (chapterId == null) return;
  const chapter = await chapterRepository.findById(chapterId);
  if (!chapter || Number(chapter.courseId) !== Number(courseId)) {
    throw createHttpError('Chương học không tồn tại trong khóa học này.', 400);
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
  await assertChapterInCourse(normalized.chapterId, courseId);
  const position = normalized.position ?? (await lessonRepository.findMaxPosition(courseId)) + 1;
  await assertPositionFree(courseId, position);
  const lessonId = await lessonRepository.create({
    courseId,
    chapterId: normalized.chapterId ?? null,
    title: normalized.title.trim(),
    content: normalized.content ?? null,
    videoPath: normalized.videoPath ?? null,
    filePath: null,
    position,
    // Bài mới mặc định là bản nháp, giảng viên chủ động công khai khi đã sẵn sàng
    status: normalized.status ?? 'draft'
  });
  return lessonRepository.findById(lessonId);
};

const updateLesson = async (lessonId, userId, role, updates) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
  const course = await requireCourseManager(lesson.course_id, userId, role);
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
    position: normalizedUpdates.position !== undefined ? normalizedUpdates.position : lesson.position,
    status: normalizedUpdates.status !== undefined ? normalizedUpdates.status : lesson.status,
    chapterId: normalizedUpdates.chapterId !== undefined ? normalizedUpdates.chapterId : (lesson.chapter_id ?? null)
  };
  validateLesson(merged);
  if (merged.chapterId != null && Number(merged.chapterId) !== Number(lesson.chapter_id)) {
    await assertChapterInCourse(merged.chapterId, lesson.course_id);
  }
  // file_path chỉ được giữ nguyên hoặc xóa (null); tệp mới phải đi qua API tải lên
  if (merged.filePath != null && merged.filePath !== lesson.file_path) {
    throw createHttpError('Tệp PDF phải được tải lên bằng chức năng chọn tệp.', 400);
  }
  if (Number(merged.position) !== Number(lesson.position)) {
    await assertPositionFree(lesson.course_id, merged.position, lessonId);
  }
  if (merged.status !== 'public') {
    await assertKeepsPublicLessonForStudents(course, lesson);
  }
  await lessonRepository.update(lessonId, {
    ...merged,
    title: merged.title.trim()
  });
  await courseRepository.setDraftIfNoPublicLessons(lesson.course_id);
  if (lesson.file_path && merged.filePath == null) {
    await removeStoredPdf(lesson.file_path);
  }
  return lessonRepository.findById(lessonId);
};

const deleteLesson = async (lessonId, userId, role) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
  const course = await requireCourseManager(lesson.course_id, userId, role);
  await assertKeepsPublicLessonForStudents(course, lesson);
  await lessonRepository.remove(lessonId);
  await removeStoredPdf(lesson.file_path);
  await courseRepository.setDraftIfNoPublicLessons(lesson.course_id);
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
    assertLessonVisibleToStudent(lesson);
    await assertLessonUnlocked(userId, lesson);
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

// HT-10: PATCH trạng thái bài học (Bản nháp <-> Công khai)
const updateLessonStatus = async (lessonId, userId, role, status) => {
  if (!LESSON_STATUSES.includes(status)) {
    throw createHttpError('Trạng thái bài học chỉ được là "draft" hoặc "public".', 400);
  }
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) throw createHttpError('Không tìm thấy bài học.', 404);
  const course = await requireCourseManager(lesson.course_id, userId, role);
  if (status !== 'public') {
    await assertKeepsPublicLessonForStudents(course, lesson);
  }
  await lessonRepository.updateStatus(lessonId, status);
  await courseRepository.setDraftIfNoPublicLessons(lesson.course_id);
  return lessonRepository.findById(lessonId);
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
  updateLessonStatus,
  swapLessons
};
