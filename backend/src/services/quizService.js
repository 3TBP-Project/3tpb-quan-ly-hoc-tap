const quizRepository = require('../repositories/quizRepository');

const MAX_ATTEMPTS = 3;
const GRACE_PERIOD_MINUTES = 1; // 1 phút dung sai độ trễ mạng

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const parseFalseAnswers = (falseAnswerRaw) => {
  if (!falseAnswerRaw) return [];
  try {
    const parsed = JSON.parse(falseAnswerRaw);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch (e) {
    // Dự phòng nếu dữ liệu là chuỗi đơn
  }
  return [String(falseAnswerRaw)];
};

/**
 * Bắt đầu lượt làm bài trắc nghiệm (HT-06)
 */
const start = async (userId, courseId) => {
  // 1. Kiểm tra khóa học và thời gian làm bài
  const course = await quizRepository.findCourseById(courseId);
  if (!course) {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }
  if (!course.quiz_duration || course.quiz_duration <= 0) {
    throw createHttpError('Khóa học này chưa cấu hình thời gian làm bài trắc nghiệm.', 400);
  }

  // 2. Lấy danh sách câu hỏi và ẩn đáp án đúng (HT-NFR1)
  const rawQuestions = await quizRepository.getQuestionsByCourseId(courseId);
  if (!rawQuestions || rawQuestions.length === 0) {
    throw createHttpError('Khóa học hiện chưa có câu hỏi trắc nghiệm.', 400);
  }

  const sanitizedQuestions = rawQuestions.map((q) => {
    const falseOptions = parseFalseAnswers(q.false_answer);
    const allOptions = [q.correct_answer, ...falseOptions];

    return {
      id: q.id,
      content: q.content,
      options: shuffleArray(allOptions)
    };
  });

  // 3. Khóa kiểm tra ghi danh, đếm lượt (< 3) và tạo bản ghi quiz_attempt trong Transaction
  const startedAt = new Date();
  const { attempt, attemptNumber } = await quizRepository.createAttemptWithLock({
    userId,
    courseId,
    startedAt,
    maxAttempts: MAX_ATTEMPTS
  });

  return {
    attemptId: attempt.id,
    courseId: course.id,
    courseTitle: course.title,
    quizDuration: course.quiz_duration,
    startedAt,
    attemptNumber,
    remainingAttempts: MAX_ATTEMPTS - attemptNumber,
    questions: sanitizedQuestions
  };
};

/**
 * Nộp bài và chấm điểm tự động ở phía Server (HT-06 & HT-NFR1)
 */
const submit = async (attemptId, userId, answers = {}) => {
  // 1. Kiểm tra lượt làm bài tồn tại và thuộc quyền sở hữu của userId
  const attempt = await quizRepository.findAttemptById(attemptId);
  if (!attempt) {
    throw createHttpError('Không tìm thấy lượt làm bài.', 404);
  }
  if (attempt.user_id !== userId) {
    throw createHttpError('Bạn không có quyền nộp lượt làm bài này.', 403);
  }
  if (attempt.submitted_at !== null) {
    throw createHttpError('Lượt làm bài này đã được nộp trước đó.', 400);
  }

  // 2. Kiểm tra hạn nộp bài ở Server: started_at + quiz_duration + 1 phút dung sai
  const course = await quizRepository.findCourseById(attempt.course_id);
  if (!course) {
    throw createHttpError('Khóa học không tồn tại.', 404);
  }

  const now = new Date();
  const startedAt = new Date(attempt.started_at);
  const deadlineMs = startedAt.getTime() + (course.quiz_duration + GRACE_PERIOD_MINUTES) * 60 * 1000;

  if (now.getTime() > deadlineMs) {
    throw createHttpError('Đã quá thời gian làm bài quy định. Hệ thống từ chối ghi nhận bài nộp.', 400);
  }

  // 3. Chấm điểm trên Server
  const questions = await quizRepository.getQuestionsByCourseId(attempt.course_id);
  const totalQuestions = questions.length;
  let correctCount = 0;

  const safeAnswers = answers && typeof answers === 'object' ? answers : {};

  const details = questions.map((q) => {
    const rawSelected = safeAnswers[q.id] ?? safeAnswers[String(q.id)] ?? null;
    const selectedAnswer = typeof rawSelected === 'string' ? rawSelected.trim() : null;
    const isCorrect = selectedAnswer !== null && selectedAnswer === q.correct_answer.trim();

    if (isCorrect) {
      correctCount++;
    }

    return {
      questionId: q.id,
      content: q.content,
      selectedAnswer,
      correctAnswer: q.correct_answer,
      isCorrect
    };
  });

  const score = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 10 * 100) / 100
    : 0;

  // 4. Cập nhật nguyên tử (chỉ thành công nếu submitted_at vẫn đang là NULL)
  const updated = await quizRepository.updateAttemptResultIfNotSubmitted(attemptId, userId, {
    score,
    submitted_at: now
  });

  if (!updated) {
    throw createHttpError('Lượt làm bài này đã được nộp trước đó.', 400);
  }

  const bestScore = await quizRepository.getBestScore(userId, attempt.course_id);

  return {
    attemptId,
    score,
    bestScore,
    correctCount,
    totalQuestions,
    submittedAt: now,
    details
  };
};

module.exports = {
  start,
  submit
};