// AI-assisted
const chapterService = require('../services/chapterService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveId = (value) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const sendError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const badId = (res, message) => res.status(400).json({ status: 'error', message });

// GET /api/courses/:courseId/chapters
const listChapters = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) return badId(res, 'ID khóa học không hợp lệ.');
  try {
    const data = await chapterService.listChapters(courseId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return sendError(res, error, 'Không thể tải danh sách chương.', 'Lỗi khi tải chương học:');
  }
};

// POST /api/courses/:courseId/chapters  { title }
const createChapter = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) return badId(res, 'ID khóa học không hợp lệ.');
  try {
    const data = await chapterService.createChapter(courseId, req.user.id, req.user.role, req.body);
    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    return sendError(res, error, 'Không thể tạo chương học.', 'Lỗi khi tạo chương học:');
  }
};

// PUT /api/chapters/:chapterId  { title }
const renameChapter = async (req, res) => {
  const chapterId = parsePositiveId(req.params.chapterId);
  if (!chapterId) return badId(res, 'ID chương không hợp lệ.');
  try {
    const data = await chapterService.renameChapter(chapterId, req.user.id, req.user.role, req.body);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return sendError(res, error, 'Không thể đổi tên chương.', 'Lỗi khi đổi tên chương:');
  }
};

// POST /api/chapters/:chapterId/swap  { targetChapterId }
const swapChapters = async (req, res) => {
  const chapterId = parsePositiveId(req.params.chapterId);
  const targetChapterId = parsePositiveId(String(req.body?.targetChapterId ?? ''));
  if (!chapterId || !targetChapterId) return badId(res, 'ID chương không hợp lệ.');
  try {
    await chapterService.swapChapters(chapterId, targetChapterId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', message: 'Đã cập nhật thứ tự chương.' });
  } catch (error) {
    return sendError(res, error, 'Không thể đổi thứ tự chương.', 'Lỗi khi đổi thứ tự chương:');
  }
};

// DELETE /api/chapters/:chapterId
const deleteChapter = async (req, res) => {
  const chapterId = parsePositiveId(req.params.chapterId);
  if (!chapterId) return badId(res, 'ID chương không hợp lệ.');
  try {
    const data = await chapterService.deleteChapter(chapterId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', message: 'Đã xóa chương học.', data });
  } catch (error) {
    return sendError(res, error, 'Không thể xóa chương học.', 'Lỗi khi xóa chương học:');
  }
};

module.exports = { listChapters, createChapter, renameChapter, swapChapters, deleteChapter };
