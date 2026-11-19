// AI-assisted [AI-15]
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const jwtSecret = 'user-route-test-secret';
process.env.JWT_SECRET = jwtSecret;

const userRepository = require('../src/repositories/userRepository');
const userService = require('../src/services/userService');
const userRoutes = require('../src/routes/userRoute');

const stubRepository = (t, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = userRepository[method];
    userRepository[method] = implementation;
  }
  t.after(() => Object.assign(userRepository, originals));
};

test('user management routes require an admin token', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin/users', userRoutes);

  const server = await new Promise((resolve, reject) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    listening.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const teacherToken = jwt.sign({ id: 2, role: 'teacher' }, jwtSecret, { expiresIn: '1h' });
  const routes = [
    { method: 'GET', path: '/api/admin/users' },
    { method: 'POST', path: '/api/admin/users', body: {} },
    { method: 'GET', path: '/api/admin/users/5' },
    { method: 'PUT', path: '/api/admin/users/5', body: {} },
    { method: 'PATCH', path: '/api/admin/users/5/lock', body: { locked: true } }
  ];

  for (const route of routes) {
    const request = (token) => fetch(`${baseUrl}${route.path}`, {
      method: route.method,
      headers: {
        ...(route.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(route.body ? { body: JSON.stringify(route.body) } : {})
    });

    assert.equal((await request()).status, 401, `${route.method} ${route.path} requires login`);
    assert.equal((await request(teacherToken)).status, 403, `${route.method} ${route.path} requires admin role`);
  }
});

test('toPublicUser maps is_locked to status and never exposes the password', () => {
  const user = userService.toPublicUser({
    id: 3, name: 'A', email: 'a@x.com', role: 'student', is_locked: 1, courses: '2',
    password: 'hash', created_at: '2026-11-01'
  });
  assert.equal(user.status, 'locked');
  assert.equal(user.courses, 2);
  assert.equal('password' in user, false);
});

test('createUser rejects the admin role and duplicate emails', async (t) => {
  stubRepository(t, {
    findByEmail: async () => ({ id: 9, email: 'dup@x.com' }),
    createUser: async () => assert.fail('must not insert')
  });

  await assert.rejects(
    userService.createUser({ name: 'Ad Min', email: 'new@x.com', password: '123456', role: 'admin' }),
    { statusCode: 400 }
  );
  await assert.rejects(
    userService.createUser({ name: 'Dup User', email: 'dup@x.com', password: '123456', role: 'student' }),
    { statusCode: 409 }
  );
});

test('setLocked refuses to touch an admin account', async (t) => {
  stubRepository(t, {
    findPublicById: async () => ({ id: 1, role: 'admin', is_locked: 0 }),
    setLocked: async () => assert.fail('must not lock an admin')
  });

  await assert.rejects(userService.setLocked('1', true), { statusCode: 404 });
});

test('updateUser keeps the password when it is left empty', async (t) => {
  let saved;
  stubRepository(t, {
    findPublicById: async () => ({ id: 5, role: 'student', name: 'Old', email: 'old@x.com', is_locked: 0 }),
    findByEmail: async () => null,
    updateUser: async (_id, data) => { saved = data; return 1; }
  });

  await userService.updateUser('5', { name: 'New Name', email: 'NEW@x.com', role: 'teacher', password: '' });
  assert.equal(saved.password_hash, null);
  assert.equal(saved.email, 'new@x.com');
  assert.equal(saved.role, 'teacher');
});
