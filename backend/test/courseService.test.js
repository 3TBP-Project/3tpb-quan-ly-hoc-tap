const test = require('node:test');
const assert = require('node:assert/strict');
const courseRepository = require('../src/repositories/courseRepository');
const courseService = require('../src/services/courseService');

// Danh sách chương học: không gọi CSDL thật trong unit test
const chapterRepository = require('../src/repositories/chapterRepository');
chapterRepository.findByCourseId = async () => [];

const stubRepository = (t, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = courseRepository[method];
    courseRepository[method] = implementation;
  }
  t.after(() => Object.assign(courseRepository, originals));
};

test('updateCourse allows an admin and preserves omitted course fields', async (t) => {
  const existingCourse = {
    id: 8,
    user_id: 12,
    title: 'Old title',
    description: 'Existing description',
    category_id: 3,
    price_course: 100,
    quiz_minutes: 30,
    thumbnail: 'cover.jpg',
    status: 'public'
  };
  let updatePayload;
  let findCount = 0;

  stubRepository(t, {
    findById: async () => {
      findCount += 1;
      return findCount === 1 ? existingCourse : { ...existingCourse, title: 'New title' };
    },
    countPublicLessons: async () => 1,
    update: async (_id, data) => {
      updatePayload = data;
      return 1;
    }
  });

  const result = await courseService.updateCourse(1, 8, { title: 'New title' }, 'admin');

  assert.deepEqual(updatePayload, {
    title: 'New title',
    description: 'Existing description',
    category_id: 3,
    price_course: 100,
    quiz_minutes: 30,
    thumbnail: 'cover.jpg',
    status: 'public'
  });
  assert.equal(result.title, 'New title');
});

test('updateCourse rejects publishing a course without public lessons', async (t) => {
  stubRepository(t, {
    findById: async () => ({
      id: 8,
      user_id: 12,
      title: 'Khóa học',
      description: null,
      category_id: 3,
      price_course: 0,
      quiz_minutes: null,
      thumbnail: null,
      status: 'draft'
    }),
    countPublicLessons: async () => 0
  });

  await assert.rejects(
    courseService.updateCourse(12, 8, { status: 'public' }, 'teacher'),
    (error) => error.statusCode === 400 && /ít nhất một bài học công khai/.test(error.message)
  );
});

test('updateCourse rejects a teacher who does not own the course', async (t) => {
  stubRepository(t, {
    findById: async () => ({ id: 8, user_id: 12 })
  });

  await assert.rejects(
    courseService.updateCourse(4, 8, { title: 'Attempted change' }, 'teacher'),
    (error) => error.statusCode === 403
  );
});

test('createCourse trims input, defaults to draft and saves for the teacher', async (t) => {
  let createPayload;
  stubRepository(t, {
    create: async (data) => {
      createPayload = data;
      return 41;
    }
  });

  const result = await courseService.createCourse(2, {
    title: '  Lập trình React  ',
    description: '  ',
    category_id: '3'
  });

  assert.equal(result.id, 41);
  assert.deepEqual(createPayload, {
    title: 'Lập trình React',
    description: null,
    category_id: 3,
    user_id: 2,
    price_course: 0,
    quiz_minutes: null,
    thumbnail: null,
    status: 'draft'
  });
});

test('createCourse rejects invalid data with 400 before touching the database', async (t) => {
  let createCalled = false;
  stubRepository(t, {
    create: async () => {
      createCalled = true;
      return 1;
    }
  });

  const invalidInputs = [
    {},
    { title: '   ', category_id: 1 },
    { title: 'A'.repeat(256), category_id: 1 },
    { title: 'Khóa học', category_id: 0 },
    { title: 'Khóa học', category_id: 1, status: 'hidden' },
    { title: 'Khóa học', category_id: 1, price_course: -5 },
    { title: 'Khóa học', category_id: 1, quiz_minutes: 0 }
  ];

  for (const input of invalidInputs) {
    await assert.rejects(
      courseService.createCourse(2, input),
      (error) => error.statusCode === 400,
      JSON.stringify(input).slice(0, 80)
    );
  }
  assert.equal(createCalled, false);
});

test('createCourse maps a missing category foreign key to 400', async (t) => {
  stubRepository(t, {
    create: async () => {
      const error = new Error('Cannot add or update a child row');
      error.code = 'ER_NO_REFERENCED_ROW_2';
      throw error;
    }
  });

  await assert.rejects(
    courseService.createCourse(2, { title: 'Khóa học', category_id: 999 }),
    (error) => error.statusCode === 400 && error.message === 'Danh mục không tồn tại.'
  );
});

test('getCourseById hides draft courses from the public but not from managers', async (t) => {
  stubRepository(t, {
    findDetailById: async (_id, userId) => ({ id: 7, teacherId: 2, status: 'draft', isEnrolled: userId === 30 }),
    findLessonSummariesByCourseId: async () => []
  });

  await assert.rejects(courseService.getCourseById(7, null), (error) => error.statusCode === 404);
  await assert.rejects(courseService.getCourseById(7, 15, 'student'), (error) => error.statusCode === 404);
  await assert.rejects(courseService.getCourseById(7, 3, 'teacher'), (error) => error.statusCode === 404);

  assert.equal((await courseService.getCourseById(7, 2, 'teacher')).id, 7);
  assert.equal((await courseService.getCourseById(7, 1, 'admin')).id, 7);
  // học viên đã ghi danh trước khi khóa học chuyển về nháp cũng không xem được nữa
  await assert.rejects(courseService.getCourseById(7, 30, 'student'), (error) => error.statusCode === 404);
});
