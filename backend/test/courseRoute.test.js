const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
require('./helpers/authStub')({ 5: 'student', 8: 'teacher' });

const jwtSecret = 'course-route-test-secret';
process.env.JWT_SECRET = jwtSecret;

const courseRoutes = require('../src/routes/courseRoute');
const lessonRoutes = require('../src/routes/lessonRoute');
const userRoutes = require('../src/routes/userRoute');
const questionRoutes = require('../src/routes/questionRoute');
const engagementRoutes = require('../src/routes/engagementRoute');
const adminUserRoutes = require('../src/routes/adminUserRoute');

test('course management routes require a teacher token', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/courses', courseRoutes);
  app.use('/api', lessonRoutes);

  const server = await new Promise((resolve, reject) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
    listeningServer.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const protectedRoutes = [
    { method: 'POST', path: '/api/courses', body: {} },
    { method: 'GET', path: '/api/courses/my-courses' },
    { method: 'PUT', path: '/api/courses/1', body: {} },
    { method: 'DELETE', path: '/api/courses/1' }
  ];

  const studentToken = jwt.sign(
    { id: 5, role: 'student' },
    jwtSecret,
    { expiresIn: '1h' }
  );

  for (const route of protectedRoutes) {
    const request = async (token) => fetch(`${baseUrl}${route.path}`, {
      method: route.method,
      headers: {
        ...(route.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(route.body ? { body: JSON.stringify(route.body) } : {})
    });

    assert.equal((await request()).status, 401, `${route.method} ${route.path} requires login`);
    assert.equal((await request(studentToken)).status, 403, `${route.method} ${route.path} requires teacher role`);
  }
});
test('student learning routes require a student token', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/courses', courseRoutes);
  app.use('/api', lessonRoutes);

  const server = await new Promise((resolve, reject) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
    listeningServer.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const teacherToken = jwt.sign(
    { id: 8, role: 'teacher' },
    jwtSecret,
    { expiresIn: '1h' }
  );
  const protectedRoutes = [
    { method: 'POST', path: '/api/courses/1/enroll' },
    { method: 'GET', path: '/api/courses/1/learn' },
    { method: 'POST', path: '/api/lessons/1/complete' }
  ];

  for (const route of protectedRoutes) {
    const request = (token) => fetch(`${baseUrl}${route.path}`, {
      method: route.method,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    assert.equal((await request()).status, 401, `${route.method} ${route.path} requires login`);
    assert.equal((await request(teacherToken)).status, 403, `${route.method} ${route.path} requires student role`);
  }
});

test('new user, management, and engagement routes enforce authentication and roles', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/courses', courseRoutes);
  app.use('/api', lessonRoutes);
  app.use('/api', questionRoutes);
  app.use('/api', engagementRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin/users', adminUserRoutes);

  const server = await new Promise((resolve, reject) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
    listeningServer.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const studentToken = jwt.sign({ id: 5, role: 'student' }, jwtSecret, { expiresIn: '1h' });
  const teacherToken = jwt.sign({ id: 8, role: 'teacher' }, jwtSecret, { expiresIn: '1h' });
  const protectedRoutes = [
    { method: 'GET', path: '/api/users/profile' },
    { method: 'PUT', path: '/api/users/profile', body: { name: 'Name' } },
    { method: 'PUT', path: '/api/users/password', body: {} },
    { method: 'GET', path: '/api/users/my-courses', wrongRoleToken: teacherToken },
    { method: 'GET', path: '/api/users/my-quizzes', wrongRoleToken: teacherToken },
    { method: 'GET', path: '/api/lessons/1', wrongRoleToken: teacherToken },
    { method: 'GET', path: '/api/courses/1/lessons', wrongRoleToken: studentToken },
    { method: 'POST', path: '/api/courses/1/lessons', body: {}, wrongRoleToken: studentToken },
    { method: 'PUT', path: '/api/lessons/1', body: {}, wrongRoleToken: studentToken },
    { method: 'DELETE', path: '/api/lessons/1', wrongRoleToken: studentToken },
    { method: 'GET', path: '/api/courses/1/questions', wrongRoleToken: studentToken },
    { method: 'POST', path: '/api/courses/1/questions', body: {}, wrongRoleToken: studentToken },
    { method: 'PUT', path: '/api/questions/1', body: {}, wrongRoleToken: studentToken },
    { method: 'DELETE', path: '/api/questions/1', wrongRoleToken: studentToken },
    { method: 'POST', path: '/api/courses/1/comments', body: {}, wrongRoleToken: teacherToken },
    { method: 'GET', path: '/api/lessons/1/discussions', wrongRoleToken: teacherToken },
    { method: 'POST', path: '/api/lessons/1/discussions', body: {}, wrongRoleToken: teacherToken },
    { method: 'GET', path: '/api/admin/users', wrongRoleToken: studentToken },
    { method: 'PUT', path: '/api/admin/users/1', body: { is_locked: true }, wrongRoleToken: studentToken },
    { method: 'DELETE', path: '/api/admin/users/1', wrongRoleToken: studentToken }
  ];

  for (const route of protectedRoutes) {
    const request = async (token) => fetch(`${baseUrl}${route.path}`, {
      method: route.method,
      headers: {
        ...(route.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(route.body ? { body: JSON.stringify(route.body) } : {})
    });

    assert.equal((await request()).status, 401, `${route.method} ${route.path} requires login`);
    if (route.wrongRoleToken) {
      assert.equal((await request(route.wrongRoleToken)).status, 403, `${route.method} ${route.path} role guard`);
    }
  }
});
