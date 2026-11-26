// AI-assisted [AI-04]
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

const getFalseOptions = (question) => {
  // The quiz contract is one correct answer plus three distractors.
  const options = [
    ...parseFalseAnswers(question.false_answer),
    question.false_answer_2,
    question.false_answer_3
  ];

  return options
    .map((option) => (typeof option === 'string' ? option.trim() : ''))
    .filter(Boolean)
    .slice(0, 3);
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
  // Khóa học nháp / bị ẩn thì học viên không làm bài được nữa
  if (course.status !== 'public') {
    throw createHttpError('Khóa học hiện không còn công khai nên bạn không thể làm bài.', 404);
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
    const falseOptions = getFalseOptions(q);
    if (falseOptions.length !== 3) {
      throw createHttpError(`Câu hỏi ${q.id} chưa được cấu hình đủ 4 lựa chọn.`, 500);
    }

    const allOptions = [q.correct_answer, ...falseOptions];

    return {
      id: q.id,
      content: q.content,
      options: shuffleArray(allOptions)
    };
  });

  // 3. Khóa kiểm tra ghi danh, đếm lượt (< 3) và tạo bản ghi quiz_attempt trong Transaction.
  //    Nếu đang có lượt làm dở chưa hết giờ thì trả lại lượt đó (F5 / đóng tab không mất lượt).
  const now = new Date();
  const { attempt, attemptNumber, resumed = false } = await quizRepository.createAttemptWithLock({
    userId,
    courseId,
    startedAt: now,
    maxAttempts: MAX_ATTEMPTS,
    questions: sanitizedQuestions,
    graceMinutes: GRACE_PERIOD_MINUTES
  });

  let questions = sanitizedQuestions;
  if (resumed) {
    // Giữ nguyên thứ tự lựa chọn đã hiển thị lúc bắt đầu lượt này
    const saved = (await quizRepository.getAttemptAnswers(attempt.id))
      .filter((row) => row.question_id !== null)
      .map((row) => ({
        id: Number(row.question_id),
        content: row.question_content,
        options: parseOptions(row.options)
      }))
      .filter((q) => q.options.length === 4);
    if (saved.length > 0) questions = saved;
  }

  return {
    attemptId: Number(attempt.id),
    courseId: course.id,
    courseTitle: course.title,
    quizDuration: course.quiz_duration,
    startedAt: resumed ? attempt.started_at : now,
    attemptNumber,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attemptNumber),
    resumed,
    questions
  };
};

// HT-07: đóng các lượt bỏ dở đã quá giờ để lịch sử làm bài phản ánh đúng số lượt đã dùng
const closeExpiredAttempts = (userId) =>
  quizRepository.closeExpiredAttempts({ userId, graceMinutes: GRACE_PERIOD_MINUTES });

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
    if (attempt.status === 'expired') {
      throw createHttpError('Lượt làm bài này đã hết giờ và được hệ thống tự đóng.', 400);
    }
    throw createHttpError('Lượt làm bài này đã được nộp trước đó.', 400);
  }

  // 2. Kiểm tra hạn nộp bài ở Server: started_at + quiz_duration + 1 phút dung sai
  const course = await quizRepository.findCourseById(attempt.course_id);
  if (!course) {
    throw createHttpError('Khóa học không tồn tại.', 404);
  }
  if (course.status !== 'public') {
    throw createHttpError('Khóa học hiện không còn công khai nên bạn không thể nộp bài.', 404);
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
      isCorrect,
      options: [q.correct_answer, ...getFalseOptions(q)]
    };
  });

  const score = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 10 * 100) / 100
    : 0;

  // 4. Cập nhật nguyên tử (chỉ thành công nếu submitted_at vẫn đang là NULL)
  const updated = await quizRepository.updateAttemptResultIfNotSubmitted(attemptId, userId, {
    score,
    submitted_at: now
  }, details);

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
    details: details.map(({ options, ...item }) => item)
  };
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const parseOptions = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((option) => String(option)) : [];
  } catch {
    return [];
  }
};

const toTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const review = async (attemptId, userId) => {
  const attempt = await quizRepository.findAttemptForReview(attemptId);
  if (!attempt || Number(attempt.user_id) !== Number(userId)) {
    throw createHttpError('Không tìm thấy lượt làm bài.', 404);
  }
  if (attempt.submitted_at === null || attempt.score === null) {
    throw createHttpError('Lượt làm bài này chưa được nộp nên chưa thể xem lại.', 400);
  }

  let rows = [];
  let snapshotAvailable = true;
  try {
    rows = await quizRepository.getAttemptAnswers(attemptId);
  } catch {
    rows = [];
  }

  let questions = rows
    .filter((row) => row.correct_answer !== null)
    .map((row, index) => {
      const options = parseOptions(row.options);
      const selectedAnswer = row.selected_answer ?? null;
      const selectedIndex = selectedAnswer === null ? -1 : options.indexOf(selectedAnswer);
      const correctIndex = options.indexOf(row.correct_answer);
      return {
        number: index + 1,
        questionId: row.question_id === null ? null : Number(row.question_id),
        content: row.question_content,
        options: options.map((text, i) => ({ label: OPTION_LABELS[i] ?? String(i + 1), text })),
        selectedAnswer,
        selectedLabel: selectedIndex >= 0 ? OPTION_LABELS[selectedIndex] : null,
        correctAnswer: row.correct_answer,
        correctLabel: correctIndex >= 0 ? OPTION_LABELS[correctIndex] : null,
        isCorrect: Boolean(Number(row.is_correct)),
        isAnswered: selectedAnswer !== null
      };
    });

  if (questions.length === 0) {
    snapshotAvailable = false;
    const currentQuestions = await quizRepository.getQuestionsByCourseId(attempt.course_id);
    questions = currentQuestions.map((row, index) => {
      const falseOptions = getFalseOptions(row);
      const options = [row.correct_answer, ...falseOptions];
      const correctIndex = options.indexOf(row.correct_answer);
      return {
        number: index + 1,
        questionId: Number(row.id),
        content: row.content,
        options: options.map((text, i) => ({ label: OPTION_LABELS[i] ?? String(i + 1), text })),
        selectedAnswer: null,
        selectedLabel: null,
        correctAnswer: row.correct_answer,
        correctLabel: OPTION_LABELS[correctIndex] ?? null,
        isCorrect: false,
        isAnswered: false
      };
    });
  }

  const correctCount = questions.filter((q) => q.isCorrect).length;
  const unansweredCount = snapshotAvailable
    ? questions.filter((q) => !q.isAnswered).length
    : 0;
  const started = toTime(attempt.started_at);
  const finished = toTime(attempt.submitted_at);

  return {
    attemptId: Number(attempt.id),
    courseId: Number(attempt.course_id),
    courseTitle: attempt.course_title,
    attemptNumber: Number(attempt.attempt_number),
    maxAttempts: MAX_ATTEMPTS,
    score: Number(attempt.score),
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
    durationMinutes: started !== null && finished !== null
      ? Math.max(1, Math.round((finished - started) / 60000))
      : null,
    hasDetails: questions.length > 0,
    totalQuestions: questions.length,
    correctCount,
    wrongCount: snapshotAvailable ? questions.length - correctCount - unansweredCount : 0,
    unansweredCount,
    snapshotAvailable,
    questions
  };
};

module.exports = {
  start,
  submit,
  review,
  closeExpiredAttempts
};