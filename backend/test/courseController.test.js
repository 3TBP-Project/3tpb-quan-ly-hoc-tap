// AI-assisted [AI-05]
const test = require('node:test');
const assert = require('node:assert/strict');
const courseRepository = require('../src/repositories/courseRepository');
const courseController = require('../src/controllers/courseController');
const courseService = require('../src/services/courseService');

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

test('listCourses passes search and selected filters to repository', async (t) => {
  const originalFindPage = courseRepository.findPage;
  let received;
  courseRepository.findPage = async (params) => {
    received = params;
    return { courses: [], total: 0 };
  };
  t.after(() => {
    courseRepository.findPage = originalFindPage;
  });

  const response = createResponse();
  await courseController.listCourses({
    query: {
      page: '2',
      limit: '4',
      search: '  React  ',
      categoryId: '1',
      teacherId: '9'
    }
  }, response);

  assert.deepEqual(received, {
    page: 2,
    limit: 4,
    search: 'React',
    categoryId: 1,
    teacherId: 9
  });
  assert.equal(response.statusCode, 200);
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

test('listCourses rejects invalid filter IDs without querying repository', async (t) => {
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
  await courseController.listCourses({ query: { categoryId: 'not-an-id' } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(findPageCalled, false);
});

test('getCourseDetail forwards the authenticated user for enrollment status', async (t) => {
  const originalGetCourseById = courseService.getCourseById;
  let received;
  courseService.getCourseById = async (...args) => {
    received = args;
    return { id: 7, isEnrolled: true, lessons: [] };
  };
  t.after(() => {
    courseService.getCourseById = originalGetCourseById;
  });

  const response = createResponse();
  await courseController.getCourseDetail({
    params: { id: '7' },
    user: { id: 12, role: 'student' }
  }, response);

  assert.deepEqual(received, [7, 12]);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.isEnrolled, true);
});

test('createCourse does not expose internal errors to clients', async (t) => {
  const originalCreateCourse = courseService.createCourse;
  const originalConsoleError = console.error;
  courseService.createCourse = async () => {
    throw new Error('ER_BAD_FIELD_ERROR: internal_course_column');
  };
  console.error = () => {};
  t.after(() => {
    courseService.createCourse = originalCreateCourse;
    console.error = originalConsoleError;
  });

  const response = createResponse();
  await courseController.createCourse({ body: {}, user: { id: 2 } }, response);

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, 'Không thể tạo khóa học lúc này.');
  assert.doesNotMatch(response.body.message, /internal_course_column/);
});
