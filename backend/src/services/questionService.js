// AI-assisted [AI-13]
const courseRepository = require('../repositories/courseRepository');
const questionRepository = require('../repositories/questionRepository');

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Kiểm tra khóa học tồn tại và đúng giảng viên sở hữu (HT-11)
const assertCourseOwnership = async (teacherId, courseId) => {
  const course = await questionRepository.findCourseById(courseId);
  if (!course) {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }
  if (Number(course.user_id) !== Number(teacherId)) {
    throw createHttpError('Bạn không có quyền chỉnh sửa câu hỏi của khóa học này.', 403);
  }
  return course;
};

const requireCourseManager = async (courseId, userId, role) => {
  const course = await courseRepository.findById(courseId);
  if (!course) throw createHttpError('Không tìm thấy khóa học.', 404);
  if (role !== 'admin' && Number(course.user_id) !== Number(userId)) {
    throw createHttpError('Bạn không có quyền quản lý câu hỏi của khóa học này.', 403);
  }
};

// Định dạng câu hỏi trả về cho giao diện giảng viên (HT-11)
const formatQuestionForTeacher = (row) => {
  const wrongAnswers = [row.falseAnswer, row.falseAnswer2, row.falseAnswer3].filter(
    (item) => item !== null && item !== undefined && String(item).trim() !== ''
  );
  const options = [row.correctAnswer, ...wrongAnswers];
  while (options.length < 4) {
    options.push('');
  }
  return {
    id: Number(row.id),
    courseId: Number(row.courseId),
    content: row.content,
    correctAnswer: row.correctAnswer,
    falseAnswer: row.falseAnswer,
    falseAnswer2: row.falseAnswer2,
    falseAnswer3: row.falseAnswer3,
    wrongAnswers,
    options: options.slice(0, 4),
    correctIndex: 0,
  };
};

// Kiểm tra dữ liệu đầu vào (NFR3): đủ 4 phương án không trùng nhau, 1 đáp án đúng
const validateTeacherQuestionPayload = (payload = {}) => {
  const content = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (!content) {
    throw createHttpError('Nội dung câu hỏi không được để trống.', 400);
  }

  let correctAnswer = '';
  let wrongAnswers = [];

  if (Array.isArray(payload.options)) {
    if (payload.options.length !== 4) {
      throw createHttpError('Mỗi câu hỏi trắc nghiệm phải có đúng 4 lựa chọn.', 400);
    }
    const cleanedOptions = payload.options.map((opt) =>
      typeof opt === 'string' ? opt.trim() : ''
    );
    if (cleanedOptions.some((opt) => !opt)) {
      throw createHttpError('Vui lòng nhập đầy đủ nội dung cho cả 4 lựa chọn.', 400);
    }
    if (cleanedOptions.some((opt) => opt.length > 255)) {
      throw createHttpError('Mỗi phương án trả lời không được vượt quá 255 ký tự.', 400);
    }

    const uniqueSet = new Set(cleanedOptions.map((opt) => opt.toLowerCase()));
    if (uniqueSet.size !== 4) {
      throw createHttpError('4 lựa chọn của câu hỏi không được trùng lặp nội dung.', 400);
    }

    const correctIndex = Number(payload.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw createHttpError('Vui lòng chọn 1 đáp án đúng hợp lệ (từ A đến D).', 400);
    }

    correctAnswer = cleanedOptions[correctIndex];
    wrongAnswers = cleanedOptions.filter((_, idx) => idx !== correctIndex);
  } else {
    correctAnswer =
      typeof payload.correct_answer === 'string'
        ? payload.correct_answer.trim()
        : typeof payload.correctAnswer === 'string'
          ? payload.correctAnswer.trim()
          : '';

    const rawFalse = Array.isArray(payload.false_answers)
      ? payload.false_answers
      : [
          payload.falseAnswer ?? payload.false_answer,
          payload.falseAnswer2 ?? payload.false_answer_2,
          payload.falseAnswer3 ?? payload.false_answer_3,
        ];

    wrongAnswers = rawFalse
      .map((opt) => (typeof opt === 'string' ? opt.trim() : ''))
      .filter(Boolean);

    if (!correctAnswer || wrongAnswers.length !== 3) {
      throw createHttpError('Câu hỏi phải gồm 1 đáp án đúng và 3 đáp án sai không để trống.', 400);
    }

    const allFour = [correctAnswer, ...wrongAnswers];
    if (allFour.some((opt) => opt.length > 255)) {
      throw createHttpError('Mỗi phương án trả lời không được vượt quá 255 ký tự.', 400);
    }
    if (new Set(allFour.map((opt) => opt.toLowerCase())).size !== 4) {
      throw createHttpError('4 lựa chọn của câu hỏi không được trùng lặp nội dung.', 400);
    }
  }

  return {
    content,
    correctAnswer,
    falseAnswer: wrongAnswers[0],
    falseAnswer2: wrongAnswers[1],
    falseAnswer3: wrongAnswers[2],
  };
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
    falseAnswer3: 'false_answer_3',
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

// --- Nghiệp vụ cho Giảng viên (HT-11) ---
const getTeacherCourses = async (teacherId) => {
  return questionRepository.findCoursesByTeacherId(teacherId);
};

const getCourseQuestions = async (teacherId, courseId) => {
  const course = await assertCourseOwnership(teacherId, courseId);
  const rows = await questionRepository.findByCourseId(courseId);

  return {
    course: {
      id: Number(course.id),
      title: course.title,
      quizDuration: course.quiz_minutes,
      quizMinutes: course.quiz_minutes,
    },
    questions: rows.map(formatQuestionForTeacher),
  };
};

const updateQuizDuration = async (teacherId, courseId, rawDuration) => {
  await assertCourseOwnership(teacherId, courseId);

  const duration = Number(rawDuration);
  if (!Number.isInteger(duration) || duration <= 0 || duration > 300) {
    throw createHttpError('Thời gian làm bài phải là số nguyên từ 1 đến 300 phút.', 400);
  }

  await questionRepository.updateCourseQuizDuration(courseId, duration);
  return { courseId: Number(courseId), quizDuration: duration, quizMinutes: duration };
};

const createTeacherQuestion = async (teacherId, courseId, payload) => {
  await assertCourseOwnership(teacherId, courseId);
  const validated = validateTeacherQuestionPayload(payload);

  const newId = await questionRepository.create({
    courseId,
    ...validated,
  });

  const created = await questionRepository.findById(newId);
  return formatQuestionForTeacher(created);
};

const updateTeacherQuestion = async (teacherId, courseId, questionId, payload) => {
  await assertCourseOwnership(teacherId, courseId);

  const existing = await questionRepository.findById(questionId);
  if (!existing || Number(existing.courseId) !== Number(courseId)) {
    throw createHttpError('Không tìm thấy câu hỏi trong khóa học này.', 404);
  }

  const validated = validateTeacherQuestionPayload(payload);
  await questionRepository.update(questionId, validated);

  const updated = await questionRepository.findById(questionId);
  return formatQuestionForTeacher(updated);
};

const deleteTeacherQuestion = async (teacherId, courseId, questionId) => {
  await assertCourseOwnership(teacherId, courseId);

  const existing = await questionRepository.findById(questionId);
  if (!existing || Number(existing.courseId) !== Number(courseId)) {
    throw createHttpError('Không tìm thấy câu hỏi trong khóa học này.', 404);
  }

  await questionRepository.remove(questionId);
  return true;
};

// --- Nghiệp vụ chuẩn REST (develop) ---
const listByCourse = async (courseId, userId, role) => {
  await requireCourseManager(courseId, userId, role);
  return questionRepository.findByCourseId(courseId);
};

const createQuestion = async (courseId, userId, role, data) => {
  await requireCourseManager(courseId, userId, role);
  const questionId = await questionRepository.create({
    courseId,
    ...normalizeQuestion(data),
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
    ...normalizeQuestion(data, false),
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

module.exports = {
  getTeacherCourses,
  getCourseQuestions,
  updateQuizDuration,
  createTeacherQuestion,
  updateTeacherQuestion,
  deleteTeacherQuestion,
  listByCourse,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};