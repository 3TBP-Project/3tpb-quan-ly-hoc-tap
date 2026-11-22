const test = require('node:test');
const assert = require('node:assert/strict');
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { pool: { query: async () => [[], []] } }
};
const { pool } = require('../src/config/db');
const courseRepository = require('../src/repositories/courseRepository');
const enrollmentRepository = require('../src/repositories/enrollmentRepository');
const lessonRepository = require('../src/repositories/lessonRepository');
const enrollmentService = require('../src/services/enrollmentService');
const lessonService = require('../src/services/lessonService');
const courseService = require('../src/services/courseService');

const stubMethods = (t, repository, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = repository[method];
    repository[method] = implementation;
  }
  t.after(() => Object.assign(repository, originals));
};

test('lesson repository stores a document path without PDF blob columns', async (t) => {
  let query;
  stubMethods(t, pool, {
    query: async (sql, params) => {
      query = { sql, params };
      return [{ insertId: 10 }, []];
    }
  });

  const id = await lessonRepository.create({
    courseId: 4,
    title: 'Intro',
    content: null,
    videoPath: null,
    filePath: '/files/lesson.pdf',
    position: 1
  });

  assert.equal(id, 10);
  assert.match(query.sql, /file_path/);
  assert.doesNotMatch(query.sql, /file_data|file_name/);
  assert.equal(query.params[4], '/files/lesson.pdf');
});

test('enroll creates one enrollment and reports repeats as already enrolled', async (t) => {
  let createCount = 0;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 4, title: 'Course', status: 'public' })
  });
  stubMethods(t, enrollmentRepository, {
    findCourseById: async () => ({ id: 4, title: 'Course', status: 'public' }),
    findByStudentAndCourse: async () => null,
    create: async () => ++createCount === 1 ? 20 : 21
  });

  const first = await enrollmentService.enroll(12, 4);
  assert.deepEqual(first, {
    id: 20,
    studentId: 12,
    courseId: 4,
    enrolled: true,
    alreadyEnrolled: false
  });
});

test('enroll returns not found for a missing course', async (t) => {
  let createCalled = false;
  stubMethods(t, courseRepository, {
    findById: async () => null
  });
  stubMethods(t, enrollmentRepository, {
    findCourseById: async () => null,
    create: async () => {
      createCalled = true;
      return true;
    }
  });

  await assert.rejects(enrollmentService.enroll(12, 99), (error) => error.statusCode === 404);
  assert.equal(createCalled, false);
});

test('learning data is denied before querying lesson content when not enrolled', async (t) => {
  let lessonsQueried = false;
  stubMethods(t, lessonRepository, {
    findCourseById: async () => ({ id: 4, title: 'Course' }),
    findByCourseIdWithProgress: async () => {
      lessonsQueried = true;
      return [];
    }
  });
  stubMethods(t, enrollmentRepository, {
    exists: async () => false
  });

  await assert.rejects(
    lessonService.getLearnData(12, 4),
    (error) => error.statusCode === 403
  );
  assert.equal(lessonsQueried, false);
});

test('learning data returns only the current student progress', async (t) => {
  let received;
  stubMethods(t, lessonRepository, {
    findCourseById: async () => ({ id: 4, title: 'Course' }),
    findByCourseIdWithProgress: async (courseId, userId) => {
      received = { courseId, userId };
      return [
        { id: 3, isCompleted: true },
        { id: 4, isCompleted: false }
      ];
    }
  });
  stubMethods(t, enrollmentRepository, {
    exists: async () => true
  });

  const result = await lessonService.getLearnData(12, 4);

  assert.deepEqual(received, { courseId: 4, userId: 12 });
  assert.deepEqual(result.completedLessonIds, [3]);
  assert.deepEqual(result.course, { id: 4, title: 'Course' });
});

test('lesson creation stores a document path and normalizes position', async (t) => {
  let savedLesson;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 4, user_id: 12 })
  });
  stubMethods(t, lessonRepository, {
    create: async (data) => {
      savedLesson = data;
      return 10;
    },
    findById: async () => ({ id: 10 })
  });

  await lessonService.createLesson(
    4,
    12,
    'teacher',
    { title: 'Intro', position: '2', filePath: '/files/lesson.pdf' }
  );

  assert.equal(savedLesson.filePath, '/files/lesson.pdf');
  assert.equal(savedLesson.position, 2);
});

test('lesson completion requires enrollment and marks progress idempotently', async (t) => {
  let enrollmentExists = false;
  let completionCount = 0;
  stubMethods(t, lessonRepository, {
    findById: async () => ({ id: 7, course_id: 4 }),
    markCompleted: async () => {
      completionCount += 1;
    }
  });
  stubMethods(t, enrollmentRepository, {
    exists: async () => enrollmentExists
  });

  await assert.rejects(
    lessonService.completeLesson(12, 7),
    (error) => error.statusCode === 403
  );
  assert.equal(completionCount, 0);

  enrollmentExists = true;
  await lessonService.completeLesson(12, 7);
  await lessonService.completeLesson(12, 7);
  assert.equal(completionCount, 2);
});

test('course detail includes lesson summaries and enrollment status', async (t) => {
  stubMethods(t, courseRepository, {
    findDetailById: async (courseId, userId) => ({
      id: courseId,
      isEnrolled: userId === 12
    }),
    findLessonSummariesByCourseId: async () => [{ id: 5, title: 'Intro' }]
  });

  const result = await courseService.getCourseById(4, 12);

  assert.deepEqual(result, {
    id: 4,
    isEnrolled: true,
    lessons: [{ id: 5, title: 'Intro' }]
  });
});
