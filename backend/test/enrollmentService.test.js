const test = require('node:test');
const assert = require('node:assert/strict');
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { pool: { query: async () => [[], []] } }
};

const enrollmentRepository = require('../src/repositories/enrollmentRepository');
const enrollmentService = require('../src/services/enrollmentService');

const originalMethods = {
  findCourseById: enrollmentRepository.findCourseById,
  findByStudentAndCourse: enrollmentRepository.findByStudentAndCourse,
  create: enrollmentRepository.create,
  findCoursesByStudent: enrollmentRepository.findCoursesByStudent
};

test.afterEach(() => {
  Object.assign(enrollmentRepository, originalMethods);
});

test('không ghi danh khi khóa học không tồn tại', async () => {
  enrollmentRepository.findCourseById = async () => null;

  await assert.rejects(
    enrollmentService.enroll(5, 99),
    (error) => error.statusCode === 404
  );
});

test('chỉ cho phép ghi danh khóa học công khai', async () => {
  enrollmentRepository.findCourseById = async () => ({ id: 1, status: 'draft' });

  await assert.rejects(
    enrollmentService.enroll(5, 1),
    (error) => error.statusCode === 400
  );
});

test('không cho học viên ghi danh trùng khóa học', async () => {
  enrollmentRepository.findCourseById = async () => ({ id: 1, status: 'public' });
  enrollmentRepository.findByStudentAndCourse = async () => ({ id: 10 });

  await assert.rejects(
    enrollmentService.enroll(5, 1),
    (error) => error.statusCode === 409
  );
});

test('ghi danh 2 lần liên tiếp cùng một khóa học: lần 1 thành công, lần 2 bị từ chối', async () => {
  const enrolledRecords = new Set();

  enrollmentRepository.findCourseById = async () => ({ id: 1, status: 'public' });
  enrollmentRepository.findByStudentAndCourse = async (studentId, courseId) => {
    return enrolledRecords.has(`${studentId}:${courseId}`) ? { id: 20 } : null;
  };
  enrollmentRepository.create = async (studentId, courseId) => {
    enrolledRecords.add(`${studentId}:${courseId}`);
    return 20;
  };

  assert.deepEqual(await enrollmentService.enroll(5, 1), {
    id: 20,
    studentId: 5,
    courseId: 1,
    enrolled: true,
    alreadyEnrolled: false
  });

  await assert.rejects(
    enrollmentService.enroll(5, 1),
    (error) => error.statusCode === 409
  );
});

test('ghi danh thành công khi khóa học công khai và chưa ghi danh', async () => {
  enrollmentRepository.findCourseById = async () => ({ id: 1, status: 'public' });
  enrollmentRepository.findByStudentAndCourse = async () => null;
  enrollmentRepository.create = async () => 20;

  assert.deepEqual(await enrollmentService.enroll(5, 1), {
    id: 20,
    studentId: 5,
    courseId: 1,
    enrolled: true,
    alreadyEnrolled: false
  });
});

test('lấy danh sách khóa học đã ghi danh của học viên', async () => {
  const courses = [{ id: 1, title: 'React cơ bản' }];
  enrollmentRepository.findCoursesByStudent = async (studentId) => {
    assert.equal(studentId, 5);
    return courses;
  };

  assert.deepEqual(await enrollmentService.getMyCourses(5), courses);
});