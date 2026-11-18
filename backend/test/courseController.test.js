// AI-assisted [AI-05]
const test = require('node:test');
const assert = require('node:assert/strict');
const courseRepository = require('../src/repositories/courseRepository');
const courseController = require('../src/controllers/courseController');

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('listCourses passes requested page size to repository', async (t) => {
  const originalFindPage = courseRepository.findPage;
  let received;
  courseRepository.findPage = async (params) => {
    received = params;
    return { courses: [{ id: 1, title: 'React' }], total: 4 };
  };
  t.after(() => {
    courseRepository.findPage = originalFindPage;
  });

  const response = createResponse();
  await courseController.listCourses({ query: { page: '1', limit: '3' } }, response);

  assert.deepEqual(received, { page: 1, limit: 3 });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.pagination.limit, 3);
  assert.equal(response.body.pagination.totalPages, 2);
});

test('listCourses rejects invalid pagination without querying repository', async (t) => {
  const originalFindPage = courseRepository.findPage;
  let findPageCalled = false;
  courseRepository.findPage = async () => {
    findPageCalled = true;
    return { courses: [], total: 0 };
  };
  t.after(() => {
    courseRepository.findPage = originalFindPage;
  });

  const response = createResponse();
  await courseController.listCourses({ query: { page: '0', limit: '3' } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(findPageCalled, false);
});
