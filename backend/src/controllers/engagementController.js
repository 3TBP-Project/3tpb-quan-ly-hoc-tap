const engagementService = require('../services/engagementService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveId = (value) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const respondError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const listCourseComments = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  try {
    const data = await engagementService.listCourseComments(courseId);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể tải đánh giá khóa học.', 'Lỗi khi tải đánh giá:');
  }
};

const createCourseComment = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ status: 'error', message: 'Dữ liệu đánh giá không hợp lệ.' });
  }
  try {
    const data = await engagementService.createCourseComment(req.user.id, courseId, req.body);
    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể gửi đánh giá.', 'Lỗi khi gửi đánh giá:');
  }
};

const listDiscussions = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  try {
    const data = await engagementService.listDiscussions(req.user.id, lessonId);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể tải thảo luận.', 'Lỗi khi tải thảo luận:');
  }
};

const createDiscussion = async (req, res) => {
  const lessonId = parsePositiveId(req.params.lessonId);
  if (!lessonId) return res.status(400).json({ status: 'error', message: 'ID bài học không hợp lệ.' });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ status: 'error', message: 'Dữ liệu thảo luận không hợp lệ.' });
  }
  let parentId = null;
  if (req.body.parentId !== undefined && req.body.parentId !== null) {
    parentId = parsePositiveId(String(req.body.parentId));
    if (!parentId) return res.status(400).json({ status: 'error', message: 'parentId không hợp lệ.' });
  }
  try {
    const data = await engagementService.createDiscussion(
      req.user.id,
      lessonId,
      { parentId, content: req.body.content }
    );
    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể gửi thảo luận.', 'Lỗi khi gửi thảo luận:');
  }
};

module.exports = { listCourseComments, createCourseComment, listDiscussions, createDiscussion };
