const test = require('node:test');
const assert = require('node:assert/strict');
const authService = require('../src/services/authService');
const quizService = require('../src/services/quizService');
const authController = require('../src/controllers/authController');
const quizController = require('../src/controllers/quizController');

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('registration does not expose internal errors to clients', async (t) => {
  const originalRegister = authService.register;
  const originalConsoleError = console.error;
  authService.register = async () => {
    throw new Error('ER_NO_SUCH_TABLE: users_internal_schema');
  };
  console.error = () => {};
  t.after(() => {
    authService.register = originalRegister;
    console.error = originalConsoleError;
  });

  const response = createResponse();
  await authController.register({ body: { name: 'Student' } }, response);

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, 'Không thể đăng ký tài khoản lúc này.');
  assert.doesNotMatch(response.body.message, /users_internal_schema/);
});

test('quiz API does not expose internal errors to clients', async (t) => {
  const originalStart = quizService.start;
  const originalConsoleError = console.error;
  quizService.start = async () => {
    throw new Error('ER_BAD_FIELD_ERROR: internal_column_name');
  };
  console.error = () => {};
  t.after(() => {
    quizService.start = originalStart;
    console.error = originalConsoleError;
  });

  const response = createResponse();
  await quizController.startQuiz({
    params: { courseId: '1' },
    user: { id: 5 }
  }, response);

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, 'Không thể khởi tạo bài trắc nghiệm lúc này.');
  assert.doesNotMatch(response.body.message, /internal_column_name/);
});

test('known client errors retain their status and message', () => {
  const { toPublicError } = require('../src/utils/errorResponse');
  const result = toPublicError(
    Object.assign(new Error('Bạn không có quyền truy cập.'), { statusCode: 403 }),
    'Lỗi hệ thống.',
    'Test error:'
  );

  assert.deepEqual(result, {
    statusCode: 403,
    message: 'Bạn không có quyền truy cập.'
  });
});
