const courseRepository = require('../repositories/courseRepository');
const questionRepository = require('../repositories/questionRepository');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireCourseManager = async (courseId, userId, role) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw createHttpError('Không tìm thấy khóa học.', 404);
  if (role !== 'admin' && Number(course.user_id) !== Number(userId)) {
    throw createHttpError('Bạn không có quyền quản lý câu hỏi của khóa học này.', 403);
  }
};

const normalizeQuestion = (data, requireAll = true) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createHttpError('Dữ liệu câu hỏi không hợp lệ.', 400);
  }
  const fieldAliases = {
    content: 'content',
    correctAnswer: 'correct_answer',
    falseAnswer: 'false_answer',
    falseAnswer2: 'false_answer_2',
    falseAnswer3: 'false_answer_3'
  };
  const acceptedFields = new Set(Object.keys(fieldAliases).concat(Object.values(fieldAliases)));
  if (Object.keys(data).some((field) => !acceptedFields.has(field))) {
    throw createHttpError('Dữ liệu câu hỏi chứa trường không được phép.', 400);
  }

  const normalized = {};
  for (const [field, alias] of Object.entries(fieldAliases)) {
    if (data[field] !== undefined && data[alias] !== undefined && data[field] !== data[alias]) {
      throw createHttpError(`Chỉ gửi một giá trị cho trường ${field}.`, 400);
    }
    const value = data[field] !== undefined ? data[field] : data[alias];
    if (value === undefined && !requireAll) continue;
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw createHttpError(`Trường ${field} không được để trống.`, 400);
    }
    if (field !== 'content' && value.length > 255) {
      throw createHttpError(`Trường ${field} không được vượt quá 255 ký tự.`, 400);
    }
    normalized[field] = value.trim();
  }
  return normalized;
};

const listByCourse = async (courseId, userId, role) => {
  await requireCourseManager(courseId, userId, role);
  return questionRepository.findByCourseId(courseId);
};

const createQuestion = async (courseId, userId, role, data) => {
  await requireCourseManager(courseId, userId, role);
  const questionId = await questionRepository.create({
    courseId,
    ...normalizeQuestion(data)
  });
  return questionRepository.findById(questionId);
};

const updateQuestion = async (questionId, userId, role, data) => {
  const question = await questionRepository.findById(questionId);
  if (!question) throw createHttpError('Không tìm thấy câu hỏi.', 404);
  await requireCourseManager(question.courseId, userId, role);
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    throw createHttpError('Cần gửi ít nhất một trường để cập nhật.', 400);
  }
  const merged = {
    content: question.content,
    correctAnswer: question.correctAnswer,
    falseAnswer: question.falseAnswer,
    falseAnswer2: question.falseAnswer2,
    falseAnswer3: question.falseAnswer3,
    ...normalizeQuestion(data, false)
  };
  await questionRepository.update(questionId, normalizeQuestion(merged));
  return questionRepository.findById(questionId);
};

const deleteQuestion = async (questionId, userId, role) => {
  const question = await questionRepository.findById(questionId);
  if (!question) throw createHttpError('Không tìm thấy câu hỏi.', 404);
  await requireCourseManager(question.courseId, userId, role);
  await questionRepository.remove(questionId);
};

module.exports = { listByCourse, createQuestion, updateQuestion, deleteQuestion };
