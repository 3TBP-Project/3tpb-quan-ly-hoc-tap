// AI-assisted [AI-17]
// HT-09: giảng viên sửa khóa học - tải lên / thay / xóa ảnh bìa
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');

const TEACHER_ID = 876543;
const OTHER_TEACHER_ID = 876544;
require('./helpers/authStub')({ [TEACHER_ID]: 'teacher', [OTHER_TEACHER_ID]: 'teacher' });

const jwtSecret = 'course-thumbnail-test-secret';
process.env.JWT_SECRET = jwtSecret;

const courseRoutes = require('../src/routes/courseRoute');
const courseRepository = require('../src/repositories/courseRepository');
const {
  COURSE_THUMBNAIL_DIR,
  MAX_COURSE_THUMBNAIL_SIZE
} = require('../src/middlewares/courseThumbnailUploadMiddleware');

const COURSE_ID = 987123; // id riêng để dọn tệp test, không đụng ảnh thật
const PNG_BYTES = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32, 1)
]);

const listTestFiles = () =>
  fs.readdirSync(COURSE_THUMBNAIL_DIR).filter((f) => f.startsWith(`${COURSE_ID}-`));
const cleanTestFiles = () =>
  listTestFiles().forEach((f) => fs.rmSync(path.join(COURSE_THUMBNAIL_DIR, f), { force: true }));
const waitForUnlink = () => new Promise((resolve) => setTimeout(resolve, 50));

const startServer = async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/courses', courseRoutes);
  const server = await new Promise((resolve, reject) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
    s.once('error', reject);
  });
  t.after(() => new Promise((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  }));
  return `http://127.0.0.1:${server.address().port}`;
};

const stubRepository = (t, stubs) => {
  const originals = {};
  for (const [name, impl] of Object.entries(stubs)) {
    originals[name] = courseRepository[name];
    courseRepository[name] = impl;
  }
  t.after(() => Object.assign(courseRepository, originals));
};

const tokenFor = (id) => jwt.sign({ id, role: 'teacher' }, jwtSecret, { expiresIn: '1h' });

const upload = (baseUrl, { bytes, type, name, userId = TEACHER_ID, courseId = COURSE_ID }) => {
  const form = new FormData();
  if (bytes) form.append('thumbnail', new Blob([bytes], { type }), name);
  return fetch(`${baseUrl}/api/courses/${courseId}/thumbnail`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenFor(userId)}` },
    body: form
  });
};

const ownCourse = (thumbnail = null) => ({
  id: COURSE_ID,
  title: 'Khóa học test',
  user_id: TEACHER_ID,
  category_id: 1,
  status: 'draft',
  thumbnail
});

test.beforeEach(cleanTestFiles);
test.after(cleanTestFiles);

test('giảng viên thay ảnh bìa: lưu tệp mới, cập nhật CSDL và xóa ảnh cũ', async (t) => {
  const oldName = `${COURSE_ID}-1-old.png`;
  fs.writeFileSync(path.join(COURSE_THUMBNAIL_DIR, oldName), PNG_BYTES);
  let saved;
  stubRepository(t, {
    findById: async () => ownCourse(`/uploads/courses/${oldName}`),
    updateThumbnail: async (_id, url) => { saved = url; return 1; }
  });
  const baseUrl = await startServer(t);

  const res = await upload(baseUrl, { bytes: PNG_BYTES, type: 'image/png', name: 'bia.png' });
  const body = await res.json();
  await waitForUnlink();

  assert.equal(res.status, 200);
  assert.match(saved, new RegExp(`^/uploads/courses/${COURSE_ID}-\\d+-[0-9a-f]{12}\\.png$`));
  assert.equal(body.data.thumbnail, saved);
  assert.deepEqual(listTestFiles(), [path.basename(saved)], 'chỉ còn ảnh mới, ảnh cũ đã bị xóa');
});

test('giảng viên khác không được đổi ảnh bìa và tệp tải lên bị dọn', async (t) => {
  let updateCalled = false;
  stubRepository(t, {
    findById: async () => ownCourse(),
    updateThumbnail: async () => { updateCalled = true; return 1; }
  });
  const baseUrl = await startServer(t);

  const res = await upload(baseUrl, {
    bytes: PNG_BYTES, type: 'image/png', name: 'bia.png', userId: OTHER_TEACHER_ID
  });
  await waitForUnlink();

  assert.equal(res.status, 403);
  assert.equal(updateCalled, false);
  assert.deepEqual(listTestFiles(), [], 'không để lại tệp rác');
});

test('từ chối thiếu tệp, sai loại, ảnh giả mạo và ảnh quá 2 MB', async (t) => {
  let updateCalled = false;
  stubRepository(t, {
    findById: async () => ownCourse(),
    updateThumbnail: async () => { updateCalled = true; return 1; }
  });
  const baseUrl = await startServer(t);

  assert.equal((await upload(baseUrl, {})).status, 400);
  assert.equal((await upload(baseUrl, { bytes: Buffer.from('<svg/>'), type: 'image/svg+xml', name: 'a.svg' })).status, 400);
  const fake = await upload(baseUrl, { bytes: Buffer.from('not an image'), type: 'image/png', name: 'a.png' });
  assert.equal(fake.status, 400);
  assert.match((await fake.json()).message, /không phải ảnh/);
  const big = await upload(baseUrl, {
    bytes: Buffer.concat([PNG_BYTES, Buffer.alloc(MAX_COURSE_THUMBNAIL_SIZE)]),
    type: 'image/png',
    name: 'big.png'
  });
  assert.equal(big.status, 400);
  assert.match((await big.json()).message, /2 MB/);
  assert.equal((await upload(baseUrl, { bytes: PNG_BYTES, type: 'image/png', name: 'a.png', courseId: 'abc' })).status, 400);
  await waitForUnlink();

  assert.equal(updateCalled, false);
  assert.deepEqual(listTestFiles(), []);
});

test('xóa ảnh bìa: đặt thumbnail = null và xóa tệp', async (t) => {
  const oldName = `${COURSE_ID}-2-old.webp`;
  fs.writeFileSync(path.join(COURSE_THUMBNAIL_DIR, oldName), PNG_BYTES);
  let saved = 'unchanged';
  stubRepository(t, {
    findById: async () => ownCourse(`/uploads/courses/${oldName}`),
    updateThumbnail: async (_id, url) => { saved = url; return 1; }
  });
  const baseUrl = await startServer(t);

  const res = await fetch(`${baseUrl}/api/courses/${COURSE_ID}/thumbnail`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenFor(TEACHER_ID)}` }
  });
  await waitForUnlink();

  assert.equal(res.status, 200);
  assert.equal(saved, null);
  assert.deepEqual(listTestFiles(), []);
});

test('xóa ảnh bìa khi khóa học chưa có ảnh trả về 400', async (t) => {
  stubRepository(t, { findById: async () => ownCourse(null) });
  const baseUrl = await startServer(t);

  const res = await fetch(`${baseUrl}/api/courses/${COURSE_ID}/thumbnail`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenFor(TEACHER_ID)}` }
  });
  assert.equal(res.status, 400);
});

test('xóa khóa học thì xóa luôn tệp ảnh bìa', async (t) => {
  const oldName = `${COURSE_ID}-3-old.png`;
  fs.writeFileSync(path.join(COURSE_THUMBNAIL_DIR, oldName), PNG_BYTES);
  stubRepository(t, {
    findById: async () => ownCourse(`/uploads/courses/${oldName}`),
    remove: async () => 1
  });
  const baseUrl = await startServer(t);

  const res = await fetch(`${baseUrl}/api/courses/${COURSE_ID}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenFor(TEACHER_ID)}` }
  });
  await waitForUnlink();

  assert.equal(res.status, 200);
  assert.deepEqual(listTestFiles(), []);
});
