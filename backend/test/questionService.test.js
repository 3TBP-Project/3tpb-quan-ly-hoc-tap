// AI-assisted [AI-13]
const test = require('node:test');
const assert = require('node:assert/strict');
const questionRepository = require('../src/repositories/questionRepository');
const questionService = require('../src/services/questionService');

const stubRepository = (t, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = questionRepository[method];
    questionRepository[method] = implementation;
  }
  t.after(() => {
    Object.assign(questionRepository, originals);
  });
};

test('giảng viên sở hữu khóa học tạo được câu hỏi 4 lựa chọn hợp lệ', async (t) => {
  let savedPayload = null;
  stubRepository(t, {
    findCourseById: async () => ({ id: 1, title: 'NodeJS', user_id: 2, quiz_duration: 30 }),
    create: async (data) => {
      savedPayload = data;
      return 99;
    },
    findById: async () => ({
      id: 99,
      courseId: 1,
      content: 'ExpressJS là gì?',
      correctAnswer: 'Web framework cho Node.js',
      falseAnswer: 'Hệ quản trị CSDL',
      falseAnswer2: 'Trình duyệt web',
      falseAnswer3: 'Hệ điều hành',
    }),
  });

  const created = await questionService.createTeacherQuestion(2, 1, {
    content: 'ExpressJS là gì?',
    options: ['Hệ quản trị CSDL', 'Web framework cho Node.js', 'Trình duyệt web', 'Hệ điều hành'],
    correctIndex: 1,
  });

  assert.equal(savedPayload.correctAnswer, 'Web framework cho Node.js');
  assert.equal(savedPayload.falseAnswer, 'Hệ quản trị CSDL');
  assert.equal(savedPayload.falseAnswer2, 'Trình duyệt web');
  assert.equal(savedPayload.falseAnswer3, 'Hệ điều hành');
  assert.equal(created.id, 99);
});

test('từ chối giảng viên không sở hữu khóa học sửa câu hỏi (403)', async (t) => {
  let updateCalled = false;
  stubRepository(t, {
    findCourseById: async () => ({ id: 1, title: 'NodeJS', user_id: 2, quiz_duration: 30 }),
    updateQuestion: async () => {
      updateCalled = true;
      return true;
    },
  });

  await assert.rejects(
    questionService.updateTeacherQuestion(3, 1, 10, {
      content: 'Câu hỏi sửa trái phép',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
    }),
    (err) => err.statusCode === 403 && /không có quyền/i.test(err.message)
  );
  assert.equal(updateCalled, false);
});

test('từ chối lưu khi câu hỏi thiếu 4 lựa chọn hoặc thời gian làm bài <= 0', async (t) => {
  stubRepository(t, {
    findCourseById: async () => ({ id: 1, title: 'NodeJS', user_id: 2, quiz_duration: 30 }),
  });

  await assert.rejects(
    questionService.createTeacherQuestion(2, 1, {
      content: 'Câu hỏi thiếu đáp án',
      options: ['Chỉ có A', 'Chỉ có B'],
      correctIndex: 0,
    }),
    (err) => err.statusCode === 400
  );

  await assert.rejects(
    questionService.updateQuizDuration(2, 1, 0),
    (err) => err.statusCode === 400
  );
});