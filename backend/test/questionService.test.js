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
    createQuestion: async (data) => {
      savedPayload = data;
      return 99;
    },
    findQuestionById: async () => ({
      id: 99,
      course_id: 1,
      content: 'ExpressJS là gì?',
      correct_answer: 'Web framework cho Node.js',
      false_answer: JSON.stringify(['Hệ quản trị CSDL', 'Trình duyệt web', 'Hệ điều hành']),
    }),
  });

  const created = await questionService.createQuestion(2, 1, {
    content: 'ExpressJS là gì?',
    options: ['Hệ quản trị CSDL', 'Web framework cho Node.js', 'Trình duyệt web', 'Hệ điều hành'],
    correctIndex: 1,
  });

  assert.equal(savedPayload.correctAnswer, 'Web framework cho Node.js');
  assert.deepEqual(JSON.parse(savedPayload.falseAnswersJson), [
    'Hệ quản trị CSDL',
    'Trình duyệt web',
    'Hệ điều hành',
  ]);
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
    questionService.updateQuestion(3, 1, 10, {
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
    questionService.createQuestion(2, 1, {
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