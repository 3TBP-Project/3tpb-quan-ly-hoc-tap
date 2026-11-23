// AI-assisted [AI-06]
// HT-07: Hồ sơ và kết quả học tập
const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const userRepository = require('../src/repositories/userRepository');
const userService = require('../src/services/userService');

const stubMethods = (t, repository, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = repository[method];
    repository[method] = implementation;
  }
  t.after(() => Object.assign(repository, originals));
};

test('đổi mật khẩu thành công khi nhập đúng mật khẩu hiện tại', async (t) => {
  const oldHash = await bcrypt.hash('123456', 4);
  let savedHash;
  stubMethods(t, userRepository, {
    findPasswordById: async () => ({ id: 5, password: oldHash }),
    updatePassword: async (_id, hash) => {
      savedHash = hash;
      return true;
    }
  });

  await userService.changePassword(5, { currentPassword: '123456', newPassword: 'abcdef' });
  assert.ok(savedHash, 'phải lưu mật khẩu mới');
  assert.notEqual(savedHash, 'abcdef', 'không lưu mật khẩu dạng thô');
  assert.equal(await bcrypt.compare('abcdef', savedHash), true);
});

test('từ chối đổi mật khẩu khi sai mật khẩu hiện tại hoặc mật khẩu mới quá ngắn', async (t) => {
  const oldHash = await bcrypt.hash('123456', 4);
  let updateCalled = false;
  stubMethods(t, userRepository, {
    findPasswordById: async () => ({ id: 5, password: oldHash }),
    updatePassword: async () => {
      updateCalled = true;
      return true;
    }
  });

  await assert.rejects(
    userService.changePassword(5, { currentPassword: 'sai-mat-khau', newPassword: 'abcdef' }),
    (error) => error.statusCode === 400 && /không đúng/.test(error.message)
  );
  await assert.rejects(
    userService.changePassword(5, { currentPassword: '123456', newPassword: '123' }),
    (error) => error.statusCode === 400
  );
  await assert.rejects(
    userService.changePassword(5, { currentPassword: '123456', newPassword: '123456' }),
    (error) => error.statusCode === 400
  );
  assert.equal(updateCalled, false);
});

test('lịch sử làm bài gom theo khóa học, đánh số lượt và lấy điểm cao nhất', async (t) => {
  stubMethods(t, userRepository, {
    // Repository trả về mới nhất trước
    listQuizHistory: async () => [
      { attemptId: 4, courseId: 2, courseTitle: 'ReactJS', score: 8.5, status: 'submitted',
        startedAt: '2026-11-21T10:00:00Z', submittedAt: '2026-11-21T10:41:00Z' },
      { attemptId: 3, courseId: 1, courseTitle: 'Node.js', score: null, status: 'doing',
        startedAt: '2026-11-20T21:00:00Z', submittedAt: null },
      { attemptId: 2, courseId: 1, courseTitle: 'Node.js', score: 9, status: 'submitted',
        startedAt: '2026-11-19T09:00:00Z', submittedAt: '2026-11-19T09:19:00Z' },
      { attemptId: 1, courseId: 1, courseTitle: 'Node.js', score: 6, status: 'submitted',
        startedAt: '2026-11-18T20:00:00Z', submittedAt: '2026-11-18T20:22:00Z' }
    ]
  });

  const history = await userService.getMyQuizzes(5);
  assert.equal(history.length, 2);

  const [react, node] = history; // khóa có lượt nộp gần nhất xếp trước
  assert.equal(react.courseId, 2);
  assert.equal(node.courseId, 1);
  assert.equal(node.bestScore, 9);
  assert.deepEqual(node.attempts.map((a) => a.attemptNumber), [1, 2], 'bỏ qua lượt chưa nộp');
  assert.deepEqual(node.attempts.map((a) => a.durationMinutes), [22, 19]);
});
