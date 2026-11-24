const test = require('node:test');
const assert = require('node:assert/strict');
const lessonRepository = require('../src/repositories/lessonRepository');
const courseRepository = require('../src/repositories/courseRepository');
const lessonService = require('../src/services/lessonService');

// Danh sách chương học: không gọi CSDL thật trong unit test
const chapterRepository = require('../src/repositories/chapterRepository');
chapterRepository.findByCourseId = async () => [];

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
    countIncompletePrevious: async () => 0,
    findById: async () => ({ id: 1, course_id: 5, title: 'Bài', status: 'public', course_status: 'public', file_path: '1732266000000-0123456789abcdef01234567.pdf' })
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

test('createLesson saves new lessons as draft unless a status is given', async (t) => {
  ownCourse(t);
  const payloads = [];
  stub(t, lessonRepository, {
    findMaxPosition: async () => 0,
    findByPosition: async () => null,
    create: async (data) => { payloads.push(data); return 1; },
    findById: async () => ({ id: 1 })
  });

  await lessonService.createLesson(5, 2, 'teacher', { title: 'Bài nháp' });
  await lessonService.createLesson(5, 2, 'teacher', { title: 'Bài công khai', status: 'public' });
  assert.equal(payloads[0].status, 'draft');
  assert.equal(payloads[1].status, 'public');
  await assert.rejects(
    lessonService.createLesson(5, 2, 'teacher', { title: 'Bài', status: 'hidden' }),
    (error) => error.statusCode === 400
  );
});

test('updateLessonStatus is limited to the course owner and valid statuses', async (t) => {
  ownCourse(t);
  let saved;
  stub(t, lessonRepository, {
    findById: async () => ({ id: 3, course_id: 5, status: 'draft' }),
    updateStatus: async (id, status) => { saved = { id, status }; return true; }
  });

  await lessonService.updateLessonStatus(3, 2, 'teacher', 'public');
  assert.deepEqual(saved, { id: 3, status: 'public' });
  await assert.rejects(
    lessonService.updateLessonStatus(3, 9, 'teacher', 'draft'),
    (error) => error.statusCode === 403
  );
  await assert.rejects(
    lessonService.updateLessonStatus(3, 2, 'teacher', 'archived'),
    (error) => error.statusCode === 400
  );
});

test('students cannot open, complete or download a draft lesson', async (t) => {
  const enrollmentRepository = require('../src/repositories/enrollmentRepository');
  stub(t, lessonRepository, {
    findById: async () => ({ id: 1, course_id: 5, title: 'Nháp', status: 'draft', course_status: 'public', file_path: null })
  });
  stub(t, enrollmentRepository, { exists: async () => true });

  for (const call of [
    () => lessonService.getLesson(30, 1),
    () => lessonService.completeLesson(30, 1),
    () => lessonService.getLessonFile(1, 30, 'student')
  ]) {
    await assert.rejects(call(), (error) => error.statusCode === 404);
  }
});

test('enrolled students are locked out once the course goes back to draft or is hidden', async (t) => {
  const enrollmentRepository = require('../src/repositories/enrollmentRepository');
  const engagementService = require('../src/services/engagementService');
  let lessonsQueried = false;
  let courseStatus = 'draft';
  stub(t, lessonRepository, {
    findCourseById: async () => ({ id: 5, title: 'Khóa', status: courseStatus }),
    findByCourseIdWithProgress: async () => { lessonsQueried = true; return []; },
    findById: async () => ({
      id: 1, course_id: 5, title: 'Bài', status: 'public', course_status: courseStatus, file_path: null
    })
  });
  stub(t, enrollmentRepository, { exists: async () => true });

  for (const status of ['draft', 'hidden']) {
    courseStatus = status;
    for (const call of [
      () => lessonService.getLearnData(30, 5),
      () => lessonService.getLesson(30, 1),
      () => lessonService.completeLesson(30, 1),
      () => lessonService.getLessonFile(1, 30, 'student'),
      () => engagementService.listDiscussions(30, 1)
    ]) {
      await assert.rejects(call(), (error) => error.statusCode === 404);
    }
  }
  assert.equal(lessonsQueried, false);
});

test('learn data locks every lesson after the first unfinished one and hides its content', async (t) => {
  const enrollmentRepository = require('../src/repositories/enrollmentRepository');
  stub(t, lessonRepository, {
    findCourseById: async () => ({ id: 5, title: 'Khóa', status: 'public' }),
    findByCourseIdWithProgress: async () => [
      { id: 1, content: 'a', videoUrl: 'v1', fileUrl: null, isCompleted: true },
      { id: 2, content: 'b', videoUrl: 'v2', fileUrl: null, isCompleted: false },
      { id: 3, content: 'c', videoUrl: 'v3', fileUrl: 'x.pdf', isCompleted: false }
    ]
  });
  stub(t, enrollmentRepository, { exists: async () => true });

  const { lessons } = await lessonService.getLearnData(30, 5);
  assert.deepEqual(lessons.map((l) => l.isLocked), [false, false, true]);
  assert.equal(lessons[1].videoUrl, 'v2');
  assert.deepEqual(
    [lessons[2].content, lessons[2].videoUrl, lessons[2].fileUrl],
    [null, null, null]
  );
});

test('students cannot open, complete or download a lesson before finishing the previous ones', async (t) => {
  const enrollmentRepository = require('../src/repositories/enrollmentRepository');
  let marked = false;
  stub(t, lessonRepository, {
    findById: async () => ({
      id: 3, course_id: 5, title: 'Bài 3', position: 3, status: 'public', course_status: 'public',
      file_path: '1732266000000-0123456789abcdef01234567.pdf'
    }),
    countIncompletePrevious: async () => 1,
    markCompleted: async () => { marked = true; }
  });
  stub(t, enrollmentRepository, { exists: async () => true });

  for (const call of [
    () => lessonService.getLesson(30, 3),
    () => lessonService.completeLesson(30, 3),
    () => lessonService.getLessonFile(3, 30, 'student')
  ]) {
    await assert.rejects(call(), (error) => error.statusCode === 403 && /hoàn thành các bài học trước/.test(error.message));
  }
  assert.equal(marked, false);
});

test('lessons can only be put in a chapter of the same course', async (t) => {
  ownCourse(t);
  const payloads = [];
  stub(t, chapterRepository, {
    findById: async (id) => (id === 7 ? { id: 7, courseId: 5 } : { id, courseId: 99 })
  });
  stub(t, lessonRepository, {
    findMaxPosition: async () => 0,
    findByPosition: async () => null,
    create: async (data) => { payloads.push(data); return 1; },
    findById: async () => ({ id: 1 })
  });

  await lessonService.createLesson(5, 2, 'teacher', { title: 'Trong chương', chapterId: '7' });
  await lessonService.createLesson(5, 2, 'teacher', { title: 'Không chương', chapterId: '' });
  assert.equal(payloads[0].chapterId, 7);
  assert.equal(payloads[1].chapterId, null);
  await assert.rejects(
    lessonService.createLesson(5, 2, 'teacher', { title: 'Sai khóa', chapterId: 8 }),
    (error) => error.statusCode === 400 && /Chương học không tồn tại/.test(error.message)
  );
});

test('deleting a chapter keeps its lessons and is limited to the course owner', async (t) => {
  const chapterService = require('../src/services/chapterService');
  ownCourse(t);
  let removed = null;
  stub(t, chapterRepository, {
    findById: async () => ({ id: 3, courseId: 5, title: 'Chương 1', position: 1 }),
    removeKeepingLessons: async (id) => { removed = id; return 2; }
  });

  await assert.rejects(chapterService.deleteChapter(3, 9, 'teacher'), (error) => error.statusCode === 403);
  assert.equal(removed, null);
  assert.deepEqual(await chapterService.deleteChapter(3, 2, 'teacher'), { detachedLessons: 2 });
  assert.equal(removed, 3);
  await assert.rejects(
    chapterService.createChapter(5, 2, 'teacher', { title: '   ' }),
    (error) => error.statusCode === 400
  );
});
