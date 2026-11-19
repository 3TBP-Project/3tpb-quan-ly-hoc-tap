const questionService = require('../services/questionService');
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

const listByCourse = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  try {
    const data = await questionService.listByCourse(courseId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể tải câu hỏi.', 'Lỗi khi tải câu hỏi:');
  }
};

const createQuestion = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  try {
    const data = await questionService.createQuestion(courseId, req.user.id, req.user.role, req.body);
    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể tạo câu hỏi.', 'Lỗi khi tạo câu hỏi:');
  }
};

const updateQuestion = async (req, res) => {
  const questionId = parsePositiveId(req.params.questionId);
  if (!questionId) return res.status(400).json({ status: 'error', message: 'ID câu hỏi không hợp lệ.' });
  try {
    const data = await questionService.updateQuestion(questionId, req.user.id, req.user.role, req.body);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể cập nhật câu hỏi.', 'Lỗi khi cập nhật câu hỏi:');
  }
};

const deleteQuestion = async (req, res) => {
  const questionId = parsePositiveId(req.params.questionId);
  if (!questionId) return res.status(400).json({ status: 'error', message: 'ID câu hỏi không hợp lệ.' });
  try {
    await questionService.deleteQuestion(questionId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', message: 'Đã xóa câu hỏi.' });
  } catch (error) {
    return respondError(res, error, 'Không thể xóa câu hỏi.', 'Lỗi khi xóa câu hỏi:');
  }
};

module.exports = { listByCourse, createQuestion, updateQuestion, deleteQuestion };
