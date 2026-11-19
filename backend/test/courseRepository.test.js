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
