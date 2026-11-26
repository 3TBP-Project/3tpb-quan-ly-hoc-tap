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
    getBestScore: async () => 8
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
    getBestScore: async () => 9
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
// Lượt làm dở: F5 / đóng tab không mất lượt
// =========================================================================
test('start resumes an unfinished attempt with the saved option order', async (t) => {
  const startedAt = new Date(Date.now() - 5 * 60 * 1000);
  stubRepository(t, {
    findCourseById: async () => ({ id: 12, status: 'public', title: 'Test course', quiz_duration: 30 }),
    getQuestionsByCourseId: async () => [{
      id: 1, content: 'Question', correct_answer: 'correct',
      false_answer: 'wrong 1', false_answer_2: 'wrong 2', false_answer_3: 'wrong 3'
    }],
    createAttemptWithLock: async () => ({
      attempt: { id: 55, started_at: startedAt },
      attemptNumber: 2,
      resumed: true
    }),
    getAttemptAnswers: async () => [{
      question_id: 1, position: 1, question_content: 'Question',
      options: '["wrong 2","correct","wrong 3","wrong 1"]',
      selected_answer: null, correct_answer: null, is_correct: 0
    }]
  });

  const result = await quizService.start(7, 12);

  assert.equal(result.resumed, true);
  assert.equal(result.attemptId, 55);
  assert.equal(result.startedAt, startedAt, 'giữ nguyên giờ bắt đầu để đồng hồ đếm tiếp');
  assert.equal(result.remainingAttempts, 1);
  assert.deepEqual(result.questions[0].options, ['wrong 2', 'correct', 'wrong 3', 'wrong 1']);
});

test('submit of an attempt closed by the system reports that time ran out', async (t) => {
  stubRepository(t, {
    findAttemptById: async () => ({
      id: 56, user_id: 7, course_id: 12, status: 'expired',
      started_at: new Date(Date.now() - 3600000), submitted_at: new Date()
    })
  });

  await assert.rejects(
    quizService.submit(56, 7, {}),
    (error) => error.statusCode === 400 && /hết giờ/i.test(error.message)
  );
});
