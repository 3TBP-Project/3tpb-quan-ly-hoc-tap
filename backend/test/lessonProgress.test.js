const test = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../src/config/db');
const lessonRepository = require('../src/repositories/lessonRepository');
const enrollmentRepository = require('../src/repositories/enrollmentRepository');
const lessonService = require('../src/services/lessonService');

// Thay tạm hàm thật bằng hàm giả, chạy xong trả lại
const stub = (t, obj, stubs) => {
  const originals = {};
  for (const [name, fn] of Object.entries(stubs)) {
    originals[name] = obj[name];
    obj[name] = fn;
  }
  t.after(() => Object.assign(obj, originals));
};

test.after(() => pool.end()); // đóng kết nối để lệnh test kết thúc ngay

test('HT-05: đánh dấu hoàn thành 2 lần chỉ có 1 bản ghi', async (t) => {
  const table = new Map(); // giả lập lesson_progress có unique(user_id, lesson_id)
  stub(t, pool, {
    query: async (sql, [userId, lessonId]) => {
      assert.match(sql, /ON DUPLICATE KEY UPDATE/i);
      table.set(`${userId}-${lessonId}`, { userId, lessonId, isCompleted: true });
      return [{ affectedRows: 1 }];
    },
  });

  await lessonRepository.markCompleted(5, 1);
  await lessonRepository.markCompleted(5, 1);

  assert.equal(table.size, 1);
});

test('HT-05: chưa ghi danh thì bị từ chối 403 và không ghi tiến độ', async (t) => {
  let saved = 0;
  stub(t, lessonRepository, {
    findById: async () => ({ id: 1, course_id: 1 }),
    markCompleted: async () => { saved += 1; },
  });
  stub(t, enrollmentRepository, { exists: async () => false });

  await assert.rejects(lessonService.completeLesson(5, 1), (err) => err.statusCode === 403);
  assert.equal(saved, 0);
});

test('HT-05: bài học không tồn tại trả 404', async (t) => {
  stub(t, lessonRepository, { findById: async () => null });
  await assert.rejects(lessonService.completeLesson(5, 999), (err) => err.statusCode === 404);
});