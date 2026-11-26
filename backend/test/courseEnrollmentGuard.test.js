const test = require('node:test');
const assert = require('node:assert/strict');
const courseRepository = require('../src/repositories/courseRepository');
const lessonRepository = require('../src/repositories/lessonRepository');
const courseService = require('../src/services/courseService');
const lessonService = require('../src/services/lessonService');

const stub = (t, target, stubs) => {
  const originals = {};
  for (const [name, impl] of Object.entries(stubs)) {
    originals[name] = target[name];
    target[name] = impl;
  }
  t.after(() => Object.assign(target, originals));
};

const publicCourse = {
  id: 8,
  user_id: 2,
  title: 'Khóa học',
  description: null,
  category_id: 1,
  price_course: 0,
  quiz_minutes: null,
  thumbnail: null,
  status: 'public'
};

test('deleteCourse refuses a course that already has enrolled students', async (t) => {
  let removed = false;
  stub(t, courseRepository, {
    findById: async () => publicCourse,
    countEnrollments: async () => 3,
    remove: async () => { removed = true; return 1; }
  });

  await assert.rejects(
    courseService.deleteCourse(2, 8, 'teacher'),
    (error) => error.statusCode === 409 && /3 học viên đăng ký/.test(error.message)
  );
  assert.equal(removed, false);
});

test('deleteCourse also blocks an admin when students are enrolled', async (t) => {
  stub(t, courseRepository, {
    findById: async () => publicCourse,
    countEnrollments: async () => 1,
    remove: async () => 1
  });

  await assert.rejects(
    courseService.deleteCourse(99, 8, 'admin'),
    (error) => error.statusCode === 409
  );
});

test('deleteCourse removes a course without students', async (t) => {
  let removedId;
  stub(t, courseRepository, {
    findById: async () => publicCourse,
    countEnrollments: async () => 0,
    remove: async (id) => { removedId = id; return 1; }
  });

  assert.equal(await courseService.deleteCourse(2, 8, 'teacher'), true);
  assert.equal(removedId, 8);
});

test('deleteCourse reports a conflict when a student enrolls right before the delete', async (t) => {
  stub(t, courseRepository, {
    findById: async () => publicCourse,
    countEnrollments: async () => 0,
    remove: async () => 0
  });

  await assert.rejects(
    courseService.deleteCourse(2, 8, 'teacher'),
    (error) => error.statusCode === 409
  );
});

test('updateCourse refuses to move a course with students back to draft', async (t) => {
  let updated = false;
  stub(t, courseRepository, {
    findById: async () => publicCourse,
    countEnrollments: async () => 2,
    update: async () => { updated = true; return 1; }
  });

  await assert.rejects(
    courseService.updateCourse(2, 8, { status: 'draft' }, 'teacher'),
    (error) => error.statusCode === 409 && /bản nháp/.test(error.message)
  );
  assert.equal(updated, false);
});

test('updateCourse still lets a course without students go back to draft', async (t) => {
  let payload;
  stub(t, courseRepository, {
    findById: async () => (payload ? { ...publicCourse, status: 'draft' } : publicCourse),
    countEnrollments: async () => 0,
    update: async (_id, data) => { payload = data; return 1; }
  });

  await courseService.updateCourse(2, 8, { status: 'draft' }, 'teacher');
  assert.equal(payload.status, 'draft');
});

test('updateCourse does not count students when the status stays the same', async (t) => {
  let counted = false;
  stub(t, courseRepository, {
    findById: async () => ({ ...publicCourse, status: 'draft' }),
    countEnrollments: async () => { counted = true; return 5; },
    update: async () => 1
  });

  await courseService.updateCourse(2, 8, { title: 'Tên mới' }, 'teacher');
  assert.equal(counted, false);
});

test('hiding the last public lesson is refused while students are enrolled', async (t) => {
  let changed = false;
  stub(t, courseRepository, {
    findById: async () => ({ id: 5, user_id: 2, status: 'public' }),
    countPublicLessons: async () => 1,
    countEnrollments: async () => 4,
    setDraftIfNoPublicLessons: async () => false
  });
  stub(t, lessonRepository, {
    findById: async () => ({ id: 3, course_id: 5, status: 'public', position: 1, title: 'Bài 1' }),
    updateStatus: async () => { changed = true; return true; },
    update: async () => { changed = true; return 1; },
    remove: async () => { changed = true; return 1; }
  });

  for (const call of [
    () => lessonService.updateLessonStatus(3, 2, 'teacher', 'draft'),
    () => lessonService.updateLesson(3, 2, 'teacher', { status: 'draft' }),
    () => lessonService.deleteLesson(3, 2, 'teacher')
  ]) {
    await assert.rejects(call(), (error) => error.statusCode === 409);
  }
  assert.equal(changed, false);
});

test('hiding a public lesson is allowed when another public lesson remains', async (t) => {
  let saved;
  stub(t, courseRepository, {
    findById: async () => ({ id: 5, user_id: 2, status: 'public' }),
    countPublicLessons: async () => 2,
    countEnrollments: async () => 4,
    setDraftIfNoPublicLessons: async () => false
  });
  stub(t, lessonRepository, {
    findById: async () => ({ id: 3, course_id: 5, status: 'public' }),
    updateStatus: async (id, status) => { saved = { id, status }; return true; }
  });

  await lessonService.updateLessonStatus(3, 2, 'teacher', 'draft');
  assert.deepEqual(saved, { id: 3, status: 'draft' });
});
