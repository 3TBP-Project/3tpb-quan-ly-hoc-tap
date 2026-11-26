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
      if (normalizedSql.startsWith('SELECT qa.id, qa.started_at, c.quiz_minutes')) {
        return [[], []]; // không có lượt bỏ dở quá giờ
      }
      if (normalizedSql.startsWith('SELECT id, user_id, course_id, score, started_at, submitted_at FROM quiz_attempts')) {
        return [[], []]; // không có lượt đang làm dở
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
  assert.equal(result.resumed, false);
  assert.match(
    queries.find((q) => q.startsWith('SELECT COUNT(*) AS total FROM quiz_attempts')),
    /started_at IS NOT NULL/
  );
});


// Giả lập connection: các câu SELECT trả theo tiền tố, ghi lại mọi câu lệnh đã chạy
const fakeConnection = (handlers, log) => ({
  beginTransaction: async () => {},
  query: async (sql, params) => {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    log.push({ sql: normalizedSql, params });
    for (const [prefix, result] of handlers) {
      if (normalizedSql.startsWith(prefix)) return [typeof result === 'function' ? result(params) : result, []];
    }
    throw new Error(`Unexpected query: ${normalizedSql}`);
  },
  commit: async () => { log.committed = true; },
  rollback: async () => {},
  release: () => {}
});

test('createAttemptWithLock resumes an unfinished attempt instead of using a new one', async (t) => {
  const log = [];
  const startedAt = new Date(Date.now() - 5 * 60 * 1000);
  const originalGetConnection = pool.getConnection;
  pool.getConnection = async () => fakeConnection([
    ['SELECT id FROM enrollments', [{ id: 1 }]],
    ['SELECT qa.id, qa.started_at, c.quiz_minutes', [{ id: 40, started_at: startedAt, quiz_minutes: 30 }]],
    ['SELECT COUNT(*) AS total FROM quiz_attempts', [{ total: 3 }]],
    ['SELECT id, user_id, course_id, score, started_at, submitted_at FROM quiz_attempts',
      [{ id: 40, user_id: 5, course_id: 1, score: null, started_at: startedAt, submitted_at: null }]]
  ], log);
  t.after(() => { pool.getConnection = originalGetConnection; });

  const result = await quizRepository.createAttemptWithLock({
    userId: 5, courseId: 1, startedAt: new Date(), maxAttempts: 3, graceMinutes: 1
  });

  assert.equal(result.resumed, true, 'đã dùng 3 lượt nhưng lượt thứ 3 còn giờ thì vẫn làm tiếp được');
  assert.equal(result.attempt.id, 40);
  assert.equal(log.some((q) => q.sql.startsWith('INSERT') || q.sql.startsWith('UPDATE')), false);
  assert.equal(log.committed, true);
});

test('createAttemptWithLock closes an abandoned attempt that is past its deadline', async (t) => {
  const log = [];
  const startedAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 giờ trước, đề 30 phút
  const originalGetConnection = pool.getConnection;
  pool.getConnection = async () => fakeConnection([
    ['SELECT id FROM enrollments', [{ id: 1 }]],
    ['SELECT qa.id, qa.started_at, c.quiz_minutes', [{ id: 41, started_at: startedAt, quiz_minutes: 30 }]],
    ["UPDATE quiz_attempts SET score = 0, status = 'expired'", { affectedRows: 1 }],
    ['UPDATE quiz_attempt_answers', { affectedRows: 10 }],
    ['SELECT COUNT(*) AS total FROM quiz_attempts', [{ total: 1 }]],
    ['SELECT id, user_id, course_id, score, started_at, submitted_at FROM quiz_attempts', []],
    ['INSERT INTO quiz_attempts', { insertId: 42 }]
  ], log);
  t.after(() => { pool.getConnection = originalGetConnection; });

  const result = await quizRepository.createAttemptWithLock({
    userId: 5, courseId: 1, startedAt: new Date(), maxAttempts: 3, graceMinutes: 1
  });

  const closeQuery = log.find((q) => q.sql.startsWith("UPDATE quiz_attempts SET score = 0, status = 'expired'"));
  assert.ok(closeQuery, 'lượt quá giờ được đóng với 0 điểm');
  assert.equal(closeQuery.params[0].getTime(), startedAt.getTime() + 30 * 60 * 1000, 'thời điểm nộp = lúc hết giờ');
  assert.equal(result.resumed, false);
  assert.equal(result.attempt.id, 42);
  assert.equal(result.attemptNumber, 2);
});
