const test = require('node:test');
const assert = require('node:assert/strict');
const courseRepository = require('../src/repositories/courseRepository');
const courseService = require('../src/services/courseService');

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

test('updateCourse rejects a teacher who does not own the course', async (t) => {
  stubRepository(t, {
    findById: async () => ({ id: 8, user_id: 12 })
  });

  await assert.rejects(
    courseService.updateCourse(4, 8, { title: 'Attempted change' }, 'teacher'),
    (error) => error.statusCode === 403
  );
});
