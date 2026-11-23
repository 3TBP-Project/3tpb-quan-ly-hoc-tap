const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
require('dotenv').config({ quiet: true });
const stubAuthUsers = require('./helpers/authStub');
const { verifyToken, optionalVerifyToken } = require('../src/middlewares/authMiddleware');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const run = (middleware, token) => new Promise((resolve) => {
  const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(body) { resolve({ statusCode: this.statusCode, body, req }); }
  };
  middleware(req, res, () => resolve({ next: true, req }));
});

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

stubAuthUsers({
  10: 'student',
  11: { role: 'teacher', is_locked: 1 },
  12: 'student'
});

test('a locked account is rejected even with a valid token', async () => {
  for (const middleware of [verifyToken, optionalVerifyToken]) {
    const result = await run(middleware, sign({ id: 11, role: 'teacher' }));
    assert.equal(result.statusCode, 403);
    assert.equal(result.body.code, 'ACCOUNT_LOCKED');
  }
});

test('a deleted account gets 401', async () => {
  const result = await run(verifyToken, sign({ id: 999, role: 'student' }));
  assert.equal(result.statusCode, 401);
  assert.equal(result.body.code, 'INVALID_SESSION');
});

test('the role comes from the database, not the token', async () => {
  const result = await run(verifyToken, sign({ id: 12, role: 'admin' }));
  assert.equal(result.next, true);
  assert.equal(result.req.user.role, 'student');
});

test('guests pass optionalVerifyToken without a lookup', async () => {
  const result = await run(optionalVerifyToken, null);
  assert.equal(result.next, true);
  assert.equal(result.req.user, undefined);
});
