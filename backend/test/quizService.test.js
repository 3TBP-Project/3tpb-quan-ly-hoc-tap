// AI-assisted [AI-05, AI-10]
const test = require('node:test');
const assert = require('node:assert/strict');
const quizRepository = require('../src/repositories/quizRepository');
const quizService = require('../src/services/quizService');

const stubRepository = (t, stubs) => {
  const originals = {};

  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = quizRepository[method];
    quizRepository[method] = implementation;
  }

  t.after(() => {
    Object.assign(quizRepository, originals);
  });
};

test('start returns four options and does not expose answer fields', async (t) => {
  stubRepository(t, {
    findCourseById: async () => ({ id: 12, status: 'public', title: 'Test course', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [{
      id: 1,
      content: 'Question',
      correct_answer: 'correct',
      false_answer: 'wrong 1',
      false_answer_2: 'wrong 2',
      false_answer_3: 'wrong 3',
      false_answer_4: 'unused wrong 4'
    }],
    createAttemptWithLock: async () => ({
      attempt: { id: 100 },
      attemptNumber: 1
    })
  });

  const result = await quizService.start(7, 12);
  const question = result.questions[0];

  assert.equal(question.options.length, 4);
  assert.deepEqual(
    [...question.options].sort(),
    ['correct', 'wrong 1', 'wrong 2', 'wrong 3'].sort()
  );
  assert.equal(Object.hasOwn(question, 'correct_answer'), false);
  assert.equal(Object.hasOwn(question, 'false_answer_4'), false);
});

test('submit scores 8 correct answers out of 10 as 8.0', async (t) => {
  const questions = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    content: `Question ${index + 1}`,
    correct_answer: `answer-${index + 1}`
  }));
  const answers = {};
  for (const question of questions.slice(0, 8)) {
    answers[question.id] = question.correct_answer;
  }
  answers[9] = 'wrong-answer';
  answers[10] = 'wrong-answer';

  let savedResult;
  stubRepository(t, {
    findAttemptById: async () => ({
      id: 100,
      user_id: 7,
      course_id: 12,
      started_at: new Date(),
      submitted_at: null
    }),
    findCourseById: async () => ({ id: 12, status: 'public', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => questions,
    updateAttemptResultIfNotSubmitted: async (attemptId, userId, result) => {
      savedResult = result;
      return true;
    },
    getBestScore: async () => 8,
    countStartedAttempts: async () => 3
  });

  const result = await quizService.submit(100, 7, answers);

  assert.equal(result.correctCount, 8);
  assert.equal(result.totalQuestions, 10);
  assert.equal(result.score, 8);
  assert.equal(savedResult.score, 8);
});

test('submit rejects an attempt past the deadline and does not save it', async (t) => {
  const startedAt = new Date(Date.now() - (2 + 1) * 60 * 1000 - 1);
  let saveCalled = false;
  stubRepository(t, {
    findAttemptById: async () => ({
      id: 101,
      user_id: 7,
      course_id: 12,
      started_at: startedAt,
      submitted_at: null
    }),
    findCourseById: async () => ({ id: 12, status: 'public', quiz_duration: 2 }),
    updateAttemptResultIfNotSubmitted: async () => {
      saveCalled = true;
      return true;
    }
  });

  await assert.rejects(
    quizService.submit(101, 7, {}),
    (error) => error.statusCode === 400 && /quá thời gian/i.test(error.message)
  );
  assert.equal(saveCalled, false);
});

// =========================================================================
// BỔ SUNG NGÀY 10 (BẮT BUỘC): Chặn khi đã dùng hết tối đa 3 lượt làm bài
// =========================================================================
test('start rejects when the student has already used all 3 attempts', async (t) => {
  stubRepository(t, {
    findCourseById: async () => ({ id: 12, status: 'public', title: 'Test course', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [{
      id: 1,
      content: 'Question',
      correct_answer: 'correct',
      false_answer: 'wrong 1',
      false_answer_2: 'wrong 2',
      false_answer_3: 'wrong 3'
    }],
    createAttemptWithLock: async ({ maxAttempts }) => {
      assert.equal(maxAttempts, 3);
      const error = new Error('Bạn đã sử dụng hết tối đa 3 lượt làm bài cho khóa học này.');
      error.statusCode = 403;
      throw error;
    }
  });

  await assert.rejects(
    quizService.start(7, 12),
    (error) => error.statusCode === 403 && /hết tối đa 3 lượt/i.test(error.message)
  );
});

// =========================================================================
// BỔ SUNG NGÀY 10 (BẮT BUỘC): Lấy điểm cao nhất qua nhiều lượt làm bài
// =========================================================================
test('submit returns the highest score across multiple attempts', async (t) => {
  const questions = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    content: `Question ${index + 1}`,
    correct_answer: `answer-${index + 1}`
  }));
  const answers = {};
  for (const question of questions.slice(0, 6)) {
    answers[question.id] = question.correct_answer;
  }
  for (const question of questions.slice(6)) {
    answers[question.id] = 'wrong-answer';
  }

  stubRepository(t, {
    findAttemptById: async () => ({
      id: 102,
      user_id: 7,
      course_id: 12,
      started_at: new Date(),
      submitted_at: null
    }),
    findCourseById: async () => ({ id: 12, status: 'public', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => questions,
    updateAttemptResultIfNotSubmitted: async () => true,
    getBestScore: async () => 9,
    countStartedAttempts: async () => 3
  });

  const result = await quizService.submit(102, 7, answers);

  assert.equal(result.score, 6);
  assert.equal(result.bestScore, 9);
});

// =========================================================================
// BỔ SUNG ĐIỀU KIỆN BIÊN: Chặn học viên chưa ghi danh khóa học
// =========================================================================
test('start rejects when the student has not enrolled in the course', async (t) => {
  stubRepository(t, {
    findCourseById: async () => ({ id: 12, status: 'public', title: 'Test course', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [{
      id: 1,
      content: 'Question',
      correct_answer: 'correct',
      false_answer: 'wrong 1',
      false_answer_2: 'wrong 2',
      false_answer_3: 'wrong 3'
    }],
    createAttemptWithLock: async () => {
      const error = new Error('Bạn cần ghi danh khóa học trước khi làm bài trắc nghiệm.');
      error.statusCode = 403;
      throw error;
    }
  });

  await assert.rejects(
    quizService.start(99, 12),
    (error) => error.statusCode === 403 && /ghi danh/i.test(error.message)
  );
});

// =========================================================================
// BỔ SUNG ĐIỀU KIỆN BIÊN: Chặn nộp trùng lượt bài đã chấm điểm
// =========================================================================
test('submit rejects an attempt that has already been submitted', async (t) => {
  stubRepository(t, {
    findAttemptById: async () => ({
      id: 109,
      user_id: 7,
      course_id: 12,
      score: 8,
      started_at: new Date(Date.now() - 5 * 60 * 1000),
      submitted_at: new Date(Date.now() - 1 * 60 * 1000)
    })
  });

  await assert.rejects(
    quizService.submit(109, 7, { 1: 'answer-1' }),
    (error) => error.statusCode === 400 && /đã được nộp/i.test(error.message)
  );
});
// =========================================================================
// HT-07: Lưu chi tiết bài làm và xem lại bài cũ
// =========================================================================
test('start saves the shuffled option order of each question for later review', async (t) => {
  let savedQuestions;
  stubRepository(t, {
    findCourseById: async () => ({ id: 12, status: 'public', title: 'Test course', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [{
      id: 1, content: 'Question', correct_answer: 'correct',
      false_answer: 'wrong 1', false_answer_2: 'wrong 2', false_answer_3: 'wrong 3'
    }],
    createAttemptWithLock: async ({ questions }) => {
      savedQuestions = questions;
      return { attempt: { id: 100 }, attemptNumber: 1 };
    }
  });

  const result = await quizService.start(7, 12);

  assert.deepEqual(savedQuestions, result.questions);
});

test('submit passes per-question details to the repository but hides stored options in the response', async (t) => {
  let savedDetails;
  stubRepository(t, {
    findAttemptById: async () => ({ id: 103, user_id: 7, course_id: 12, started_at: new Date(), submitted_at: null }),
    findCourseById: async () => ({ id: 12, status: 'public', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [
      { id: 1, content: 'Q1', correct_answer: 'a', false_answer: 'b', false_answer_2: 'c', false_answer_3: 'd' },
      { id: 2, content: 'Q2', correct_answer: 'x', false_answer: 'y', false_answer_2: 'z', false_answer_3: 'w' }
    ],
    updateAttemptResultIfNotSubmitted: async (_id, _user, _result, details) => {
      savedDetails = details;
      return true;
    },
    getBestScore: async () => 5,
    countStartedAttempts: async () => 3
  });

  const result = await quizService.submit(103, 7, { 1: 'a', 2: 'y' });

  assert.equal(savedDetails.length, 2);
  assert.deepEqual(
    savedDetails.map(({ questionId, selectedAnswer, isCorrect }) => ({ questionId, selectedAnswer, isCorrect })),
    [
      { questionId: 1, selectedAnswer: 'a', isCorrect: true },
      { questionId: 2, selectedAnswer: 'y', isCorrect: false }
    ]
  );
  assert.deepEqual(savedDetails[0].options, ['a', 'b', 'c', 'd']);
  assert.equal(Object.hasOwn(result.details[0], 'options'), false);
});

test('review returns each question with A-D labels, chosen and correct answers', async (t) => {
  stubRepository(t, {
    findAttemptForReview: async () => ({
      id: 100, user_id: 7, course_id: 12, course_title: 'Test course', attempt_number: 2,
      score: 5, started_at: '2026-11-20T10:00:00Z', submitted_at: '2026-11-20T10:20:00Z'
    }),
    countStartedAttempts: async () => 3,
    getAttemptAnswers: async () => [
      { question_id: 1, position: 1, question_content: 'Q1', options: '["b","a","c","d"]',
        selected_answer: 'a', correct_answer: 'a', is_correct: 1 },
      { question_id: 2, position: 2, question_content: 'Q2', options: '["y","z","x","w"]',
        selected_answer: 'y', correct_answer: 'x', is_correct: 0 },
      { question_id: null, position: 3, question_content: 'Q3 (đã bị xóa)', options: '["m","n","o","p"]',
        selected_answer: null, correct_answer: 'p', is_correct: 0 }
    ]
  });

  const result = await quizService.review(100, 7);

  assert.equal(result.attemptNumber, 2);
  assert.equal(result.durationMinutes, 20);
  assert.equal(result.hasDetails, true);
  assert.deepEqual(
    [result.correctCount, result.wrongCount, result.unansweredCount, result.totalQuestions],
    [1, 1, 1, 3]
  );
  assert.deepEqual(result.questions[0].options[1], { label: 'B', text: 'a' });
  assert.equal(result.questions[0].selectedLabel, 'B');
  assert.equal(result.questions[1].selectedLabel, 'A');
  assert.equal(result.questions[1].correctLabel, 'C');
  assert.equal(result.questions[2].isAnswered, false);
  assert.equal(result.questions[2].correctLabel, 'D');
});

test('review hides attempts that belong to another student', async (t) => {
  stubRepository(t, {
    findAttemptForReview: async () => ({ id: 100, user_id: 99, score: 8, submitted_at: new Date() }),
    getAttemptAnswers: async () => {
      throw new Error('should not load answers of another student');
    }
  });

  await assert.rejects(quizService.review(100, 7), (error) => error.statusCode === 404);
});

test('review rejects an attempt that has not been submitted yet', async (t) => {
  stubRepository(t, {
    findAttemptForReview: async () => ({ id: 100, user_id: 7, score: null, submitted_at: null })
  });

  await assert.rejects(quizService.review(100, 7), (error) => error.statusCode === 400);
});

test('review of an old attempt without stored answers reports hasDetails = false', async (t) => {
  stubRepository(t, {
    findAttemptForReview: async () => ({
      id: 100, user_id: 7, course_id: 12, course_title: 'Old', attempt_number: 1,
      score: 8, started_at: '2026-11-10T09:00:00Z', submitted_at: '2026-11-10T09:22:00Z'
    }),
    countStartedAttempts: async () => 3,
    getAttemptAnswers: async () => []
  });

  const result = await quizService.review(100, 7);
  assert.equal(result.hasDetails, false);
  assert.equal(result.score, 8);
  assert.deepEqual(result.questions, []);
});

test('submit hides correct answers of wrong / blank questions while attempts remain', async (t) => {
  stubRepository(t, {
    findAttemptById: async () => ({ id: 104, user_id: 7, course_id: 12, started_at: new Date(), submitted_at: null }),
    findCourseById: async () => ({ id: 12, status: 'public', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [
      { id: 1, content: 'Q1', correct_answer: 'a', false_answer: 'b', false_answer_2: 'c', false_answer_3: 'd' },
      { id: 2, content: 'Q2', correct_answer: 'x', false_answer: 'y', false_answer_2: 'z', false_answer_3: 'w' },
      { id: 3, content: 'Q3', correct_answer: 'm', false_answer: 'n', false_answer_2: 'o', false_answer_3: 'p' }
    ],
    updateAttemptResultIfNotSubmitted: async () => true,
    getBestScore: async () => 3.33,
    countStartedAttempts: async () => 1
  });

  const result = await quizService.submit(104, 7, { 1: 'a', 2: 'y' });

  assert.equal(result.answersRevealed, false);
  assert.deepEqual(result.details.map((d) => d.correctAnswer), ['a', null, null]);
  assert.equal(JSON.stringify(result).includes('"x"'), false);
  assert.equal(JSON.stringify(result).includes('"m"'), false);
});

test('submit reveals every correct answer once all 3 attempts are used', async (t) => {
  stubRepository(t, {
    findAttemptById: async () => ({ id: 105, user_id: 7, course_id: 12, started_at: new Date(), submitted_at: null }),
    findCourseById: async () => ({ id: 12, status: 'public', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [
      { id: 2, content: 'Q2', correct_answer: 'x', false_answer: 'y', false_answer_2: 'z', false_answer_3: 'w' }
    ],
    updateAttemptResultIfNotSubmitted: async () => true,
    getBestScore: async () => 0,
    countStartedAttempts: async () => 3
  });

  const result = await quizService.submit(105, 7, { 2: 'y' });

  assert.equal(result.answersRevealed, true);
  assert.equal(result.details[0].correctAnswer, 'x');
});

test('review hides the correct option of wrong / blank questions while attempts remain', async (t) => {
  stubRepository(t, {
    findAttemptForReview: async () => ({
      id: 100, user_id: 7, course_id: 12, course_title: 'Test course', attempt_number: 1,
      score: 3.33, started_at: '2026-11-20T10:00:00Z', submitted_at: '2026-11-20T10:20:00Z'
    }),
    countStartedAttempts: async () => 2,
    getAttemptAnswers: async () => [
      { question_id: 1, position: 1, question_content: 'Q1', options: '["b","a","c","d"]',
        selected_answer: 'a', correct_answer: 'a', is_correct: 1 },
      { question_id: 2, position: 2, question_content: 'Q2', options: '["y","z","x","w"]',
        selected_answer: 'y', correct_answer: 'x', is_correct: 0 },
      { question_id: 3, position: 3, question_content: 'Q3', options: '["m","n","o","p"]',
        selected_answer: null, correct_answer: 'p', is_correct: 0 }
    ]
  });

  const result = await quizService.review(100, 7);

  assert.equal(result.answersRevealed, false);
  assert.equal(result.attemptsUsed, 2);
  assert.deepEqual(
    result.questions.map((q) => [q.correctAnswer, q.correctLabel]),
    [['a', 'B'], [null, null], [null, null]]
  );
});
