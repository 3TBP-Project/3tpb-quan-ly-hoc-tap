// Đăng ký / đăng nhập: dữ liệu sai kiểu phải trả 400, không được làm sập thành 500
const test = require('node:test');
const assert = require('node:assert/strict');
const userRepository = require('../src/repositories/userRepository');
const authService = require('../src/services/authService');

// Mặc định chặn mọi lệnh ghi CSDL: test không bao giờ được tạo tài khoản thật
const NO_WRITE = {
  createUser: async () => { throw new Error('test không được ghi vào CSDL'); }
};

const stubRepository = (t, stubs) => {
  const originals = {};
  for (const [name, impl] of Object.entries({ ...NO_WRITE, ...stubs })) {
    originals[name] = userRepository[name];
    userRepository[name] = impl;
  }
  t.after(() => Object.assign(userRepository, originals));
};

const isBadRequest = (error) => error.statusCode === 400;

test('register rejects non-string fields with 400 before touching the database', async (t) => {
  let lookedUp = false;
  stubRepository(t, { findByEmail: async () => { lookedUp = true; return null; } });

  for (const body of [
    { name: 12345, email: 'a@b.cd', password: '123456' },
    { name: 'Nguyễn An', email: 123, password: '123456' },
    { name: 'Nguyễn An', email: 'a@b.cd', password: 123456 },
    { name: ['x'], email: 'a@b.cd', password: '123456' },
    {}
  ]) {
    await assert.rejects(authService.register(body), isBadRequest, JSON.stringify(body));
  }
  assert.equal(lookedUp, false);
});

test('register enforces name, email and password length limits', async (t) => {
  stubRepository(t, { findByEmail: async () => null });

  await assert.rejects(authService.register({ name: 'a'.repeat(256), email: 'a@b.cd', password: '123456' }), isBadRequest);
  await assert.rejects(authService.register({ name: 'An', email: `${'a'.repeat(251)}@b.cd`, password: '123456' }), isBadRequest);
  await assert.rejects(authService.register({ name: 'An', email: 'a@b.cd', password: 'x'.repeat(73) }), isBadRequest);
});

test('register normalizes name and email before saving', async (t) => {
  let saved;
  stubRepository(t, {
    findByEmail: async () => null,
    createUser: async (data) => { saved = data; return { id: 1, ...data }; }
  });

  await authService.register({ name: '  Nguyễn   Văn  An ', email: ' An@Gmail.COM ', password: '123456' });

  assert.equal(saved.name, 'Nguyễn Văn An');
  assert.equal(saved.email, 'an@gmail.com');
  assert.equal(saved.role, 'student');
});

test('login rejects non-string email or password with 400', async (t) => {
  let lookedUp = false;
  stubRepository(t, { findByEmail: async () => { lookedUp = true; return null; } });

  for (const body of [{ email: 123, password: '123456' }, { email: 'a@b.cd', password: 123456 }, { email: '  ', password: 'x' }, {}]) {
    await assert.rejects(authService.login(body), isBadRequest, JSON.stringify(body));
  }
  assert.equal(lookedUp, false);
});
