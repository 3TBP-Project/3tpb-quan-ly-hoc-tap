const lessonService = require('../services/lessonService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveId = (value) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const getLearnData = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }

  try {
    const data = await lessonService.getLearnData(req.user.id, courseId);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể tải nội dung học tập lúc này.',
      'Lỗi khi tải nội dung học tập:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const completeLesson = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }

  try {
    const data = await lessonService.completeLesson(req.user.id, lessonId);
    return res.status(200).json({
      status: 'success',
      message: 'Đã đánh dấu hoàn thành bài học.',
      data
    });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể cập nhật tiến độ học tập lúc này.',
      'Lỗi khi cập nhật tiến độ bài học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const getCourseLessons = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }
  try {
    const data = await lessonService.getCourseLessons(courseId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể tải danh sách bài học.',
      'Lỗi khi tải danh sách bài học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const getLesson = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    const data = await lessonService.getLesson(req.user.id, lessonId);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể tải bài học.',
      'Lỗi khi tải bài học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const createLesson = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }
  try {
    const data = await lessonService.createLesson(
      courseId,
      req.user.id,
      req.user.role,
      req.body
    );
    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể tạo bài học.',
      'Lỗi khi tạo bài học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const updateLesson = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    const data = await lessonService.updateLesson(
      lessonId,
      req.user.id,
      req.user.role,
      req.body
    );
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể cập nhật bài học.',
      'Lỗi khi cập nhật bài học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const deleteLesson = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    await lessonService.deleteLesson(lessonId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', message: 'Đã xóa bài học.' });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể xóa bài học.',
      'Lỗi khi xóa bài học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

const sendError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

// HT-10: POST /api/lessons/:lessonId/file (multipart, trường "pdf_file")
const uploadLessonFile = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    const data = await lessonService.uploadLessonFile(lessonId, req.user.id, req.user.role, req.file);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return sendError(res, error, 'Không thể tải tệp PDF lên.', 'Lỗi khi tải tệp PDF:');
  }
};

// GET /api/lessons/:lessonId/file
const downloadLessonFile = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    const { fullPath, downloadName } = await lessonService.getLessonFile(lessonId, req.user.id, req.user.role);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.download(fullPath, downloadName);
  } catch (error) {
    return sendError(res, error, 'Không thể tải tài liệu.', 'Lỗi khi tải tài liệu:');
  }
};

// PATCH /api/lessons/:lessonId/status  { status: 'draft' | 'public' }
const updateLessonStatus = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    const data = await lessonService.updateLessonStatus(
      lessonId, req.user.id, req.user.role, req.body?.status
    );
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return sendError(res, error, 'Không thể đổi trạng thái bài học.', 'Lỗi khi đổi trạng thái bài học:');
  }
};

// POST /api/lessons/:lessonId/swap  { targetLessonId }
const swapLessons = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  const targetLessonId = parsePositiveId(String(req.body?.targetLessonId ?? ''));
  if (!lessonId || !targetLessonId) {
    return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  }
  try {
    await lessonService.swapLessons(lessonId, targetLessonId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', message: 'Đã cập nhật thứ tự bài học.' });
  } catch (error) {
    return sendError(res, error, 'Không thể đổi thứ tự bài học.', 'Lỗi khi đổi thứ tự bài học:');
  }
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
  downloadLessonFile,
  updateLessonStatus,
  swapLessons
};
