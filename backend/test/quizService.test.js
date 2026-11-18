// AI-assisted [AI-05]
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
    findCourseById: async () => ({ id: 12, quiz_duration: 30 }),
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
    findCourseById: async () => ({ id: 12, quiz_duration: 2 }),
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
