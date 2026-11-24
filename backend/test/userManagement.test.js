// AI-assisted [AI-08]
// HT-14: Quản lý người dùng
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
require('./helpers/authStub')({ 1: 'admin', 3: 'teacher' });
const bcrypt = require('bcrypt');

const jwtSecret = 'user-management-test-secret';
process.env.JWT_SECRET = jwtSecret;

const adminUserRepository = require('../src/repositories/adminUserRepository');
const adminUserService = require('../src/services/adminUserService');
const adminUserRoutes = require('../src/routes/adminUserRoute');

const stubMethods = (t, target, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = target[method];
    target[method] = implementation;
  }
  t.after(() => Object.assign(target, originals));
};

test('tạo giảng viên: kiểm tra dữ liệu, chặn trùng email, băm mật khẩu', async (t) => {
  let created;
  stubMethods(t, adminUserRepository, {
    findByEmail: async (email) => (email === 'binh@email.com' ? { id: 2, email } : null),
    createTeacher: async (data) => {
      created = data;
      return 30;
    },
    findById: async (id) => ({ id, name: created.name, email: created.email, role: 'teacher', status: 'pending', courses: 0 })
  });

  await assert.rejects(adminUserService.createTeacher({ name: '', email: 'a@b.co', password: '123456' }),
    (error) => error.statusCode === 400);
  await assert.rejects(adminUserService.createTeacher({ name: 'Lan Anh', email: 'khong-hop-le', password: '123456' }),
    (error) => error.statusCode === 400 && /Email không hợp lệ/.test(error.message));
  await assert.rejects(adminUserService.createTeacher({ name: 'Lan Anh', email: 'lan@email.com', password: '123' }),
    (error) => error.statusCode === 400);
  await assert.rejects(adminUserService.createTeacher({ name: 'Bình', email: ' BINH@email.com ', password: '123456' }),
    (error) => error.statusCode === 409);

  const teacher = await adminUserService.createTeacher({ name: ' Lan  Anh ', email: ' Lan@Email.com ', password: 'tam123' });
  assert.equal(created.name, 'Lan Anh');
  assert.equal(created.email, 'lan@email.com');
  assert.notEqual(created.passwordHash, 'tam123');
  assert.equal(await bcrypt.compare('tam123', created.passwordHash), true);
  assert.equal(teacher.role, 'teacher');
  assert.equal(teacher.status, 'pending');
});

test('xóa học viên; giảng viên chỉ xóa được khi chưa có khóa học', async (t) => {
  const users = {
    5: { id: 5, name: 'Nam', role: 'student', courses: 2 },
    6: { id: 6, name: 'Tùng', role: 'teacher', courses: 0 },
    7: { id: 7, name: 'Bình', role: 'teacher', courses: 8 },
    1: { id: 1, name: 'Admin', role: 'admin', courses: 0 }
  };
  const deleted = [];
  stubMethods(t, adminUserRepository, {
    findById: async (id) => users[id] ?? null,
    deleteStudent: async (id) => {
      deleted.push(['student', id]);
      return true;
    },
    deleteTeacherWithoutCourses: async (id) => {
      deleted.push(['teacher', id]);
      return true;
    }
  });

  await adminUserService.deleteUser('5', 1); // học viên đã ghi danh vẫn xóa được
  await assert.rejects(adminUserService.deleteUser('7', 1), (error) => error.statusCode === 409);
  await assert.rejects(adminUserService.deleteUser('1', 2), (error) => error.statusCode === 404);
  await adminUserService.deleteUser('6', 1);
  assert.deepEqual(deleted, [['student', 5], ['teacher', 6]]);
});

test('chặn / bỏ chặn chỉ áp dụng cho học viên và giảng viên', async (t) => {
  const locks = [];
  stubMethods(t, adminUserRepository, {
    findById: async (id) => (id === 1
      ? { id: 1, role: 'admin' }
      : { id, role: 'student', status: locks.at(-1)?.[1] ? 'locked' : 'active' }),
    setLocked: async (id, value) => {
      locks.push([id, value]);
      return true;
    }
  });

  assert.equal((await adminUserService.setLocked('5', 1, true)).status, 'locked');
  assert.equal((await adminUserService.setLocked('5', 1, false)).status, 'active');
  await assert.rejects(adminUserService.setLocked('1', 2, true), (error) => error.statusCode === 404);
  assert.deepEqual(locks, [[5, true], [5, false]]);
});

test('danh sách người dùng: lọc vai trò hợp lệ và trả về số lượng theo vai trò', async (t) => {
  let received;
  stubMethods(t, adminUserRepository, {
    findPage: async (args) => {
      received = args;
      return { users: [{ id: 3, role: 'teacher' }], total: 11 };
    },
    countByRole: async () => ({ all: 24, student: 15, teacher: 9 })
  });

  const data = await adminUserService.listUsers({ page: 2, limit: 5, role: 'teacher', search: '  nguyen ' });
  assert.deepEqual(received, { role: 'teacher', search: 'nguyen', page: 2, limit: 5 });
  assert.equal(data.pagination.totalPages, 3);
  assert.equal(data.counts.teacher, 9);
  await assert.rejects(adminUserService.listUsers({ role: 'admin' }), (error) => error.statusCode === 400);
});

test('API quản lý người dùng chỉ dành cho quản trị viên', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin/users', adminUserRoutes);

  const server = await new Promise((resolve, reject) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    listening.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const teacherToken = jwt.sign({ id: 3, role: 'teacher' }, jwtSecret, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: 1, role: 'admin' }, jwtSecret, { expiresIn: '1h' });

  const request = (method, path, token, body) => fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  assert.equal((await request('POST', '/api/admin/users', null, {})).status, 401);
  assert.equal((await request('POST', '/api/admin/users', teacherToken, {})).status, 403);
  // Body sai định dạng bị chặn trước khi chạm tới CSDL
  assert.equal((await request('PUT', '/api/admin/users/5', adminToken, { name: 'A', is_locked: true })).status, 400);
  assert.equal((await request('GET', '/api/admin/users?limit=500', adminToken)).status, 400);
});
