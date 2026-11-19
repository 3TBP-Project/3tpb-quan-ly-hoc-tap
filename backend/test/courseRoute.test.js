const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const jwtSecret = 'course-route-test-secret';
process.env.JWT_SECRET = jwtSecret;

const courseRoutes = require('../src/routes/courseRoute');

test('course management routes require a teacher token', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/courses', courseRoutes);

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
