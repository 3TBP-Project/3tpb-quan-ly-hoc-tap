const test = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../src/config/db');
const courseRepository = require('../src/repositories/courseRepository');

test('findPage applies filters to both results and total count', async (t) => {
  const originalQuery = pool.query;
  const queries = [];

  pool.query = async (sql, params) => {
    queries.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('COUNT(*)')) {
      return [[{ total: 1 }], []];
    }
    return [[{
      id: 2,
      teacherId: 9,
      categoryId: 1,
      lessonCount: 3
    }], []];
  };
  t.after(() => {
    pool.query = originalQuery;
  });

  const result = await courseRepository.findPage({
    page: 2,
    limit: 10,
    search: 'React',
    categoryId: 1,
    teacherId: 9
  });

  assert.match(queries[0].sql, /c\.title LIKE \?/);
  assert.match(queries[0].sql, /c\.category_id = \?/);
  assert.match(queries[0].sql, /c\.user_id = \?/);
  assert.ok(queries[0].sql.indexOf('WHERE') < queries[0].sql.indexOf('GROUP BY'));
  assert.deepEqual(queries[0].params, ['%React%', 1, 9, 10, 10]);
  assert.match(queries[1].sql, /WHERE c\.title LIKE \? AND c\.category_id = \? AND c\.user_id = \?/);
  assert.deepEqual(queries[1].params, ['%React%', 1, 9]);
  assert.equal(result.total, 1);
  assert.equal(result.courses[0].id, 2);
});
test('findDetailById returns mapped catalog fields and uses the optional user ID', async (t) => {
  const originalQuery = pool.query;
  let received;
  pool.query = async (sql, params) => {
    received = { sql, params };
    return [[{
      id: '4',
      title: 'React',
      teacherId: '9',
      teacherName: 'Teacher',
      categoryId: '2',
      categoryName: 'Web',
      lessonCount: '3',
      studentCount: '8',
      isEnrolled: 1
    }], []];
  };
  t.after(() => {
    pool.query = originalQuery;
  });

  const result = await courseRepository.findDetailById(4, 12);

  assert.deepEqual(received.params, [12, 4]);
  assert.match(received.sql, /FROM enrollments AS current_enrollment/);
  assert.equal(result.id, 4);
  assert.equal(result.lessonCount, 3);
  assert.equal(result.studentCount, 8);
  assert.equal(result.isEnrolled, true);
});

test('findLessonSummariesByCourseId returns lessons in course order', async (t) => {
  const originalQuery = pool.query;
  let received;
  pool.query = async (sql, params) => {
    received = { sql, params };
    return [[{ id: '5', order: '2', title: 'Second' }], []];
  };
  t.after(() => {
    pool.query = originalQuery;
  });

  const result = await courseRepository.findLessonSummariesByCourseId(4);

  assert.deepEqual(received.params, [4]);
  assert.match(received.sql, /ORDER BY position ASC, id ASC/);
  assert.deepEqual(result, [{ id: 5, order: 2, title: 'Second' }]);
});
