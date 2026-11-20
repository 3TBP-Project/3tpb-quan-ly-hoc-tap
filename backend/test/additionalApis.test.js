const test = require('node:test');
const assert = require('node:assert/strict');
const userRepository = require('../src/repositories/userRepository');
const courseRepository = require('../src/repositories/courseRepository');
const lessonRepository = require('../src/repositories/lessonRepository');
const enrollmentRepository = require('../src/repositories/enrollmentRepository');
const questionRepository = require('../src/repositories/questionRepository');
const engagementRepository = require('../src/repositories/engagementRepository');
const userService = require('../src/services/userService');
const adminUserService = require('../src/services/adminUserService');
const lessonService = require('../src/services/lessonService');
const questionService = require('../src/services/questionService');
const engagementService = require('../src/services/engagementService');

const stubMethods = (t, repository, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = repository[method];
    repository[method] = implementation;
  }
  t.after(() => Object.assign(repository, originals));
};

test('updateProfile validates and normalizes only allowed profile data', async (t) => {
  let received;
  stubMethods(t, userRepository, {
    findProfileById: async () => ({ id: 2, name: 'Old name', email: 'old@example.com' }),
    updateProfile: async (_id, data) => {
      received = data;
      return { id: 2, ...data };
    }
  });

  const profile = await userService.updateProfile(2, {
    name: ' New name ',
    email: ' NEW@example.com '
  });
  assert.deepEqual(received, { name: 'New name', email: 'new@example.com' });
  assert.equal(profile.name, 'New name');
  await assert.rejects(
    userService.updateProfile(2, { name: 7 }),
    (error) => error.statusCode === 400
  );
});

test('admin user service prevents self-lock and self-delete', async () => {
  await assert.rejects(
    adminUserService.setLocked('8', 8, true),
    (error) => error.statusCode === 400
  );
  await assert.rejects(
    adminUserService.deleteUser('8', 8),
    (error) => error.statusCode === 400
  );
});

test('lesson creation enforces course ownership before writing', async (t) => {
  let createCalled = false;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 4, user_id: 99 })
  });
  stubMethods(t, lessonRepository, {
    create: async () => {
      createCalled = true;
      return 10;
    }
  });

  await assert.rejects(
    lessonService.createLesson(4, 12, 'teacher', { title: 'Intro' }),
    (error) => error.statusCode === 403
  );
  assert.equal(createCalled, false);
});

test('question creation rejects teachers who do not own the course', async (t) => {
  let createCalled = false;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 4, user_id: 99 })
  });
  stubMethods(t, questionRepository, {
    create: async () => {
      createCalled = true;
      return 3;
    }
  });

  await assert.rejects(
    questionService.createQuestion(4, 12, 'teacher', {
      content: 'Q',
      correctAnswer: 'A',
      falseAnswer: 'B',
      falseAnswer2: 'C',
      falseAnswer3: 'D'
    }),
    (error) => error.statusCode === 403
  );
  assert.equal(createCalled, false);
});

test('question updates accept snake_case fields and preserve omitted answers', async (t) => {
  let updatePayload;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 4, user_id: 12 })
  });
  stubMethods(t, questionRepository, {
    findById: async () => ({
      id: 3,
      courseId: 4,
      content: 'Old',
      correctAnswer: 'A',
      falseAnswer: 'B',
      falseAnswer2: 'C',
      falseAnswer3: 'D'
    }),
    update: async (_id, data) => {
      updatePayload = data;
      return true;
    }
  });

  await questionService.updateQuestion(3, 12, 'teacher', { correct_answer: 'New answer' });

  assert.deepEqual(updatePayload, {
    content: 'Old',
    correctAnswer: 'New answer',
    falseAnswer: 'B',
    falseAnswer2: 'C',
    falseAnswer3: 'D'
  });
});

test('course ratings require enrollment before creating a comment', async (t) => {
  let createCalled = false;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 4 })
  });
  stubMethods(t, enrollmentRepository, {
    exists: async () => false
  });
  stubMethods(t, engagementRepository, {
    createCourseComment: async () => {
      createCalled = true;
      return 1;
    }
  });

  await assert.rejects(
    engagementService.createCourseComment(12, 4, { rating: 5, content: 'Good' }),
    (error) => error.statusCode === 403
  );
  assert.equal(createCalled, false);
});

test('discussion replies must refer to a parent in the same lesson', async (t) => {
  let createCalled = false;
  stubMethods(t, lessonRepository, {
    findById: async () => ({ id: 7, course_id: 4 })
  });
  stubMethods(t, enrollmentRepository, {
    exists: async () => true
  });
  stubMethods(t, engagementRepository, {
    findDiscussionById: async () => ({ id: 8, lesson_id: 9 }),
    createDiscussion: async () => {
      createCalled = true;
      return 10;
    }
  });

  await assert.rejects(
    engagementService.createDiscussion(12, 7, {
      parentId: 8,
      content: 'Reply'
    }),
    (error) => error.statusCode === 404
  );
  assert.equal(createCalled, false);
});
