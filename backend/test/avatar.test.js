// AI-assisted [AI-06]
// HT-07: đổi ảnh đại diện
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');

const jwtSecret = 'avatar-test-secret';
process.env.JWT_SECRET = jwtSecret;

const userRoutes = require('../src/routes/userRoute');
const userRepository = require('../src/repositories/userRepository');
const { AVATAR_DIR, MAX_AVATAR_SIZE } = require('../src/middlewares/avatarUploadMiddleware');

const USER_ID = 987654; // id riêng để dọn tệp test, không đụng ảnh thật
const PNG_BYTES = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32, 1)
]);

const listTestFiles = () => fs.readdirSync(AVATAR_DIR).filter((f) => f.startsWith(`${USER_ID}-`));
const cleanTestFiles = () => listTestFiles().forEach((f) => fs.rmSync(path.join(AVATAR_DIR, f), { force: true }));
const waitForUnlink = () => new Promise((resolve) => setTimeout(resolve, 50));

const startServer = async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
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
    originals[name] = userRepository[name];
    userRepository[name] = impl;
  }
  t.after(() => Object.assign(userRepository, originals));
};

const token = jwt.sign({ id: USER_ID, role: 'student' }, jwtSecret, { expiresIn: '1h' });

const upload = (baseUrl, { bytes, type, name, auth = true }) => {
  const form = new FormData();
  if (bytes) form.append('avatar', new Blob([bytes], { type }), name);
  return fetch(`${baseUrl}/api/users/me/avatar`, {
    method: 'PATCH',
    headers: auth ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });
};

test.beforeEach(cleanTestFiles);
test.after(cleanTestFiles);

test('đổi avatar thành công: lưu tệp, cập nhật CSDL và xóa ảnh cũ', async (t) => {
  const oldName = `${USER_ID}-1-old.png`;
  fs.writeFileSync(path.join(AVATAR_DIR, oldName), PNG_BYTES);
  let saved;
  stubRepository(t, {
    findProfileById: async () => ({ id: USER_ID, name: 'Học viên', avatar: `/uploads/avatars/${oldName}` }),
    updateAvatar: async (_id, url) => { saved = url; return true; }
  });
  const baseUrl = await startServer(t);

  const res = await upload(baseUrl, { bytes: PNG_BYTES, type: 'image/png', name: 'anh cua toi.png' });
  const body = await res.json();
  await waitForUnlink();

  assert.equal(res.status, 200);
  assert.match(saved, new RegExp(`^/uploads/avatars/${USER_ID}-\\d+-[0-9a-f]{12}\\.png$`));
  assert.equal(body.data.avatar, saved);
  assert.deepEqual(listTestFiles(), [path.basename(saved)], 'chỉ còn ảnh mới, ảnh cũ đã bị xóa');
});

test('từ chối khi chưa đăng nhập, thiếu tệp, sai loại hoặc giả mạo ảnh', async (t) => {
  let updateCalled = false;
  stubRepository(t, {
    findProfileById: async () => ({ id: USER_ID, avatar: null }),
    updateAvatar: async () => { updateCalled = true; return true; }
  });
  const baseUrl = await startServer(t);

  assert.equal((await upload(baseUrl, { bytes: PNG_BYTES, type: 'image/png', name: 'a.png', auth: false })).status, 401);
  assert.equal((await upload(baseUrl, {})).status, 400);
  assert.equal((await upload(baseUrl, { bytes: Buffer.from('<svg/>'), type: 'image/svg+xml', name: 'a.svg' })).status, 400);
  // Tệp văn bản đổi đuôi thành .png
  const fake = await upload(baseUrl, { bytes: Buffer.from('not an image at all'), type: 'image/png', name: 'a.png' });
  assert.equal(fake.status, 400);
  assert.match((await fake.json()).message, /không phải ảnh/);
  await waitForUnlink();

  assert.equal(updateCalled, false);
  assert.deepEqual(listTestFiles(), [], 'không để lại tệp rác');
});

test('từ chối ảnh vượt quá 2 MB', async (t) => {
  stubRepository(t, { findProfileById: async () => ({ id: USER_ID, avatar: null }) });
  const baseUrl = await startServer(t);
  const big = Buffer.concat([PNG_BYTES, Buffer.alloc(MAX_AVATAR_SIZE)]);

  const res = await upload(baseUrl, { bytes: big, type: 'image/png', name: 'big.png' });
  await waitForUnlink();
  assert.equal(res.status, 400);
  assert.match((await res.json()).message, /2 MB/);
  assert.deepEqual(listTestFiles(), []);
});

test('xóa tệp vừa tải lên nếu lưu CSDL thất bại', async (t) => {
  stubRepository(t, {
    findProfileById: async () => ({ id: USER_ID, avatar: null }),
    updateAvatar: async () => { throw new Error('db down'); }
  });
  const baseUrl = await startServer(t);
  const originalError = console.error;
  console.error = () => {};
  t.after(() => { console.error = originalError; });

  const res = await upload(baseUrl, { bytes: PNG_BYTES, type: 'image/png', name: 'a.png' });
  await waitForUnlink();
  assert.equal(res.status, 500);
  assert.deepEqual(listTestFiles(), []);
});
