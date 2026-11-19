// AI-assisted [AI-13]
const questionService = require('../services/questionService');

const parsePositiveIntId = (rawId) => {
  const parsed = Number(rawId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getTeacherCourses = async (req, res) => {
  try {
    const data = await questionService.getTeacherCourses(req.user.id);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi tải danh sách khóa học.',
    });
  }
};

const getCourseQuestions = async (req, res) => {
  try {
    const courseId = parsePositiveIntId(req.params.courseId);
    if (!courseId) {
      return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
    }

    const data = await questionService.getCourseQuestions(req.user.id, courseId);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi tải danh sách câu hỏi.',
    });
  }
};

const updateQuizDuration = async (req, res) => {
  try {
    const courseId = parsePositiveIntId(req.params.courseId);
    if (!courseId) {
      return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
    }

    const rawDuration = req.body?.quizDuration ?? req.body?.quiz_duration;
    const data = await questionService.updateQuizDuration(req.user.id, courseId, rawDuration);
    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật thời gian làm bài thành công!',
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi cập nhật thời gian làm bài.',
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const courseId = parsePositiveIntId(req.params.courseId);
    if (!courseId) {
      return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
    }

    const data = await questionService.createQuestion(req.user.id, courseId, req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Thêm câu hỏi trắc nghiệm thành công!',
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi thêm câu hỏi.',
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const courseId = parsePositiveIntId(req.params.courseId);
    const questionId = parsePositiveIntId(req.params.questionId);
    if (!courseId || !questionId) {
      return res.status(400).json({ status: 'error', message: 'Tham số ID không hợp lệ.' });
    }

    const data = await questionService.updateQuestion(req.user.id, courseId, questionId, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật câu hỏi thành công!',
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi cập nhật câu hỏi.',
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const courseId = parsePositiveIntId(req.params.courseId);
    const questionId = parsePositiveIntId(req.params.questionId);
    if (!courseId || !questionId) {
      return res.status(400).json({ status: 'error', message: 'Tham số ID không hợp lệ.' });
    }

    await questionService.deleteQuestion(req.user.id, courseId, questionId);
    return res.status(200).json({
      status: 'success',
      message: 'Xóa câu hỏi thành công!',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi xóa câu hỏi.',
    });
  }
};

module.exports = {
  getTeacherCourses,
  getCourseQuestions,
  updateQuizDuration,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};