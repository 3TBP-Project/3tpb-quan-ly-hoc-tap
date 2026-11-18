const test = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../src/config/db');
const quizRepository = require('../src/repositories/quizRepository');

test('getQuestionsByCourseId selects only the three configured distractor columns', async (t) => {
  const originalQuery = pool.query;
  let executedSql = '';

  pool.query = async (sql) => {
    executedSql = sql;
    return [[{ id: 1, false_answer: 'wrong 1', false_answer_2: 'wrong 2', false_answer_3: 'wrong 3' }], []];
  };
  t.after(() => {
    pool.query = originalQuery;
  });

  const questions = await quizRepository.getQuestionsByCourseId(1);

  assert.doesNotMatch(executedSql, /false_answer_4/);
  assert.equal(questions.length, 1);
});

test('createAttemptWithLock ignores legacy attempts without a start time', async (t) => {
  const originalGetConnection = pool.getConnection;
  const queries = [];
  let committed = false;

  const connection = {
    beginTransaction: async () => {},
    query: async (sql) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      queries.push(normalizedSql);

      if (normalizedSql.startsWith('SELECT id FROM enrollments')) {
        return [[{ id: 1 }], []];
      }
      if (normalizedSql.startsWith('SELECT COUNT(*) AS total FROM quiz_attempts')) {
        return [[{ total: 2 }], []];
      }
      if (normalizedSql.startsWith('INSERT INTO quiz_attempts')) {
        return [{ insertId: 101 }, []];
      }

      throw new Error(`Unexpected query: ${normalizedSql}`);
    },
    commit: async () => {
      committed = true;
    },
    rollback: async () => {},
    release: () => {}
  };

  pool.getConnection = async () => connection;
  t.after(() => {
    pool.getConnection = originalGetConnection;
  });

  const result = await quizRepository.createAttemptWithLock({
    userId: 5,
    courseId: 1,
    startedAt: new Date(),
    maxAttempts: 3
  });

  assert.equal(result.attemptNumber, 3);
  assert.equal(committed, true);
  assert.match(queries[1], /started_at IS NOT NULL/);
});
