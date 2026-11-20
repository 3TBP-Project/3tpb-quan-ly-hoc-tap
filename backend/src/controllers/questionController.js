// AI-assisted [AI-13]
const questionService = require('../services/questionService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveId = (value) => {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const respondError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const getTeacherCourses = async (req, res) => {
  try {
    const data = await questionService.getTeacherCourses(req.user.id);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Lỗi hệ thống khi tải danh sách khóa học.', 'Lỗi tải khóa học:');
  }
};

const getCourseQuestions = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }
  try {
    const data = await questionService.getCourseQuestions(req.user.id, courseId);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Lỗi hệ thống khi tải danh sách câu hỏi.', 'Lỗi tải câu hỏi:');
  }
};

const listByCourse = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }
  try {
    const data = await questionService.listByCourse(courseId, req.user.id, req.user.role);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return respondError(res, error, 'Không thể tải câu hỏi.', 'Lỗi khi tải câu hỏi:');
  }
};

// Phân luồng tự động giữa /api/teacher/courses/:courseId/questions và /api/courses/:courseId/questions
const getCourseQuestionsOrList = async (req, res) => {
  if (req.baseUrl === '/api/teacher') {
    return getCourseQuestions(req, res);
  }
  return listByCourse(req, res);
};

const updateQuizDuration = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }
  try {
    const rawDuration =
      req.body?.quizDuration ??
      req.body?.quiz_duration ??
      req.body?.quizMinutes ??
      req.body?.quiz_minutes;
    const data = await questionService.updateQuizDuration(req.user.id, courseId, rawDuration);
    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật thời gian làm bài thành công!',
      data,
    });
  } catch (error) {
    return respondError(res, error, 'Lỗi hệ thống khi cập nhật thời gian làm bài.', 'Lỗi cập nhật thời gian:');
  }
};

const createQuestion = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }
  try {
    const isTeacherPayload =
      req.baseUrl === '/api/teacher' ||
      Array.isArray(req.body?.options) ||
      Array.isArray(req.body?.false_answers);

    const data = isTeacherPayload
      ? await questionService.createTeacherQuestion(req.user.id, courseId, req.body)
      : await questionService.createQuestion(courseId, req.user.id, req.user.role, req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Thêm câu hỏi trắc nghiệm thành công!',
      data,
    });
  } catch (error) {
    return respondError(res, error, 'Không thể tạo câu hỏi.', 'Lỗi khi tạo câu hỏi:');
  }
};

const updateQuestion = async (req, res) => {
  const questionId = parsePositiveId(req.params.questionId);
  if (!questionId) {
    return res.status(400).json({ status: 'error', message: 'ID câu hỏi không hợp lệ.' });
  }
  try {
    if (req.params.courseId !== undefined) {
      const courseId = parsePositiveId(req.params.courseId);
      if (!courseId) {
        return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
      }
      const data = await questionService.updateTeacherQuestion(
        req.user.id,
        courseId,
        questionId,
        req.body
      );
      return res.status(200).json({
        status: 'success',
        message: 'Cập nhật câu hỏi thành công!',
        data,
      });
    }

    const data = await questionService.updateQuestion(
      questionId,
      req.user.id,
      req.user.role,
      req.body
    );
    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật câu hỏi thành công!',
      data,
    });
  } catch (error) {
    return respondError(res, error, 'Không thể cập nhật câu hỏi.', 'Lỗi khi cập nhật câu hỏi:');
  }
};

const deleteQuestion = async (req, res) => {
  const questionId = parsePositiveId(req.params.questionId);
  if (!questionId) {
    return res.status(400).json({ status: 'error', message: 'ID câu hỏi không hợp lệ.' });
  }
  try {
    if (req.params.courseId !== undefined) {
      const courseId = parsePositiveId(req.params.courseId);
      if (!courseId) {
        return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
      }
      await questionService.deleteTeacherQuestion(req.user.id, courseId, questionId);
    } else {
      await questionService.deleteQuestion(questionId, req.user.id, req.user.role);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xóa câu hỏi thành công!',
    });
  } catch (error) {
    return respondError(res, error, 'Không thể xóa câu hỏi.', 'Lỗi khi xóa câu hỏi:');
  }
};

module.exports = {
  getTeacherCourses,
  getCourseQuestions,
  listByCourse,
  getCourseQuestionsOrList,
  updateQuizDuration,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};