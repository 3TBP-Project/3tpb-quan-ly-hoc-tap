// AI-assisted [AI-13]
const questionRepository = require('../repositories/questionRepository');

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Chuyển đổi cột false_answer từ DB sang mảng 3 đáp án sai
const parseFalseAnswers = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
  } catch {
    // Dự phòng dữ liệu mẫu cũ lưu dạng chuỗi đơn
  }
  return [String(raw)];
};

const formatQuestionForTeacher = (row) => {
  const wrongAnswers = parseFalseAnswers(row.false_answer);
  const options = [row.correct_answer, ...wrongAnswers];
  while (options.length < 4) {
    options.push('');
  }
  return {
    id: Number(row.id),
    courseId: Number(row.course_id),
    content: row.content,
    correctAnswer: row.correct_answer,
    wrongAnswers,
    options: options.slice(0, 4),
    correctIndex: 0,
  };
};

// Kiểm tra khóa học tồn tại và đúng giảng viên sở hữu (HT-NFR3)
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

// Kiểm tra dữ liệu đầu vào: nội dung, đủ 4 lựa chọn không rỗng, không trùng nhau, 1 đáp án đúng
const validateQuestionPayload = (payload = {}) => {
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
    // Hỗ trợ payload trực tiếp { content, correct_answer, false_answers: [...] }
    correctAnswer =
      typeof payload.correct_answer === 'string' ? payload.correct_answer.trim() : '';
    const rawFalse = Array.isArray(payload.false_answers) ? payload.false_answers : [];
    wrongAnswers = rawFalse.map((opt) => (typeof opt === 'string' ? opt.trim() : '')).filter(Boolean);

    if (!correctAnswer || wrongAnswers.length !== 3) {
      throw createHttpError('Câu hỏi phải gồm 1 đáp án đúng và 3 đáp án sai không để trống.', 400);
    }

    const allFour = [correctAnswer, ...wrongAnswers];
    if (new Set(allFour.map((opt) => opt.toLowerCase())).size !== 4) {
      throw createHttpError('4 lựa chọn của câu hỏi không được trùng lặp nội dung.', 400);
    }
  }

  return {
    content,
    correctAnswer,
    falseAnswersJson: JSON.stringify(wrongAnswers),
  };
};

const getTeacherCourses = async (teacherId) => {
  return questionRepository.findCoursesByTeacherId(teacherId);
};

const getCourseQuestions = async (teacherId, courseId) => {
  const course = await assertCourseOwnership(teacherId, courseId);
  const rows = await questionRepository.findQuestionsByCourseId(courseId);

  return {
    course: {
      id: Number(course.id),
      title: course.title,
      quizDuration: course.quiz_duration !== null ? Number(course.quiz_duration) : null,
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
  return { courseId: Number(courseId), quizDuration: duration };
};

const createQuestion = async (teacherId, courseId, payload) => {
  await assertCourseOwnership(teacherId, courseId);
  const validated = validateQuestionPayload(payload);

  const newId = await questionRepository.createQuestion({
    courseId,
    ...validated,
  });

  const created = await questionRepository.findQuestionById(newId);
  return formatQuestionForTeacher(created);
};

const updateQuestion = async (teacherId, courseId, questionId, payload) => {
  await assertCourseOwnership(teacherId, courseId);

  const existing = await questionRepository.findQuestionById(questionId);
  if (!existing || Number(existing.course_id) !== Number(courseId)) {
    throw createHttpError('Không tìm thấy câu hỏi trong khóa học này.', 404);
  }

  const validated = validateQuestionPayload(payload);
  await questionRepository.updateQuestion(questionId, validated);

  const updated = await questionRepository.findQuestionById(questionId);
  return formatQuestionForTeacher(updated);
};

const deleteQuestion = async (teacherId, courseId, questionId) => {
  await assertCourseOwnership(teacherId, courseId);

  const existing = await questionRepository.findQuestionById(questionId);
  if (!existing || Number(existing.course_id) !== Number(courseId)) {
    throw createHttpError('Không tìm thấy câu hỏi trong khóa học này.', 404);
  }

  await questionRepository.deleteQuestion(questionId);
  return true;
};

module.exports = {
  getTeacherCourses,
  getCourseQuestions,
  updateQuizDuration,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};