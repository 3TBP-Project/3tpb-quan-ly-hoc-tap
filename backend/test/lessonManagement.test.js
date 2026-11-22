const test = require('node:test');
const assert = require('node:assert/strict');
const lessonRepository = require('../src/repositories/lessonRepository');
const courseRepository = require('../src/repositories/courseRepository');
const lessonService = require('../src/services/lessonService');

const stub = (t, target, stubs) => {
  const originals = {};
  for (const [name, impl] of Object.entries(stubs)) {
    originals[name] = target[name];
    target[name] = impl;
  }
  t.after(() => Object.assign(target, originals));
};

const ownCourse = (t) => stub(t, courseRepository, { findById: async () => ({ id: 5, user_id: 2 }) });

test('createLesson rejects a position that another lesson already uses', async (t) => {
  ownCourse(t);
  let created = false;
  stub(t, lessonRepository, {
    findByPosition: async () => ({ id: 9, title: 'Giới thiệu', position: 1 }),
    create: async () => { created = true; return 1; }
  });

  await assert.rejects(
    lessonService.createLesson(5, 2, 'teacher', { title: 'Bài mới', position: 1 }),
    (error) => error.statusCode === 409 && /Vị trí 1 đã có bài học "Giới thiệu"/.test(error.message)
  );
  assert.equal(created, false);
});

test('createLesson defaults to the next free position', async (t) => {
  ownCourse(t);
  let payload;
  stub(t, lessonRepository, {
    findMaxPosition: async () => 4,
    findByPosition: async () => null,
    create: async (data) => { payload = data; return 11; },
    findById: async () => ({ id: 11 })
  });

  await lessonService.createLesson(5, 2, 'teacher', { title: 'Bài mới' });
  assert.equal(payload.position, 5);
  assert.equal(payload.filePath, null);
});

test('createLesson does not accept a file path typed by the client', async (t) => {
  ownCourse(t);
  await assert.rejects(
    lessonService.createLesson(5, 2, 'teacher', { title: 'Bài', position: 2, filePath: '../../.env' }),
    (error) => error.statusCode === 400
  );
});

test('updateLesson only checks position conflicts when the position changes', async (t) => {
  ownCourse(t);
  const lesson = { id: 3, course_id: 5, title: 'Bài 3', content: null, video_path: null, file_path: null, position: 3 };
  let excluded;
  stub(t, lessonRepository, {
    findById: async () => lesson,
    findByPosition: async (_courseId, _position, excludeId) => {
      excluded = excludeId;
      return { id: 4, title: 'Bài 4', position: 4 };
    },
    update: async () => true
  });

  await lessonService.updateLesson(3, 2, 'teacher', { title: 'Đổi tên' });
  assert.equal(excluded, undefined);

  await assert.rejects(
    lessonService.updateLesson(3, 2, 'teacher', { position: 4 }),
    (error) => error.statusCode === 409
  );
  assert.equal(excluded, 3);
});

test('swapLessons refuses lessons from different courses', async (t) => {
  ownCourse(t);
  let swapped = false;
  stub(t, lessonRepository, {
    findById: async (id) => ({ id, course_id: id === 1 ? 5 : 6, position: id }),
    swapPositions: async () => { swapped = true; }
  });

  await assert.rejects(
    lessonService.swapLessons(1, 2, 2, 'teacher'),
    (error) => error.statusCode === 400
  );
  assert.equal(swapped, false);
});

test('getLessonFile blocks students who are not enrolled', async (t) => {
  const enrollmentRepository = require('../src/repositories/enrollmentRepository');
  stub(t, lessonRepository, {
    findById: async () => ({ id: 1, course_id: 5, title: 'Bài', file_path: '1732266000000-0123456789abcdef01234567.pdf' })
  });
  stub(t, enrollmentRepository, { exists: async () => false });

  await assert.rejects(
    lessonService.getLessonFile(1, 30, 'student'),
    (error) => error.statusCode === 403
  );
});

test('getCourseLessons only returns full lesson data to the course owner or an admin', async (t) => {
  ownCourse(t);
  stub(t, lessonRepository, {
    findSummariesByCourseId: async () => [{ id: 1, title: 'Bài 1', content: 'bí mật' }]
  });

  await assert.rejects(
    lessonService.getCourseLessons(5, 3, 'teacher'),
    (error) => error.statusCode === 403
  );
  assert.equal((await lessonService.getCourseLessons(5, 2, 'teacher')).length, 1);
  assert.equal((await lessonService.getCourseLessons(5, 1, 'admin')).length, 1);
});
