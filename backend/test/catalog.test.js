// AI-assisted [AI-07]
// HT-15: Danh mục và duyệt khóa học
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

const jwtSecret = 'catalog-test-secret';
process.env.JWT_SECRET = jwtSecret;

const catalogRepository = require('../src/repositories/catalogRepository');
const courseRepository = require('../src/repositories/courseRepository');
const catalogService = require('../src/services/catalogService');
const courseService = require('../src/services/courseService');
const adminCatalogRoutes = require('../src/routes/adminCatalogRoute');

const stubMethods = (t, target, stubs) => {
  const originals = {};
  for (const [method, implementation] of Object.entries(stubs)) {
    originals[method] = target[method];
    target[method] = implementation;
  }
  t.after(() => Object.assign(target, originals));
};

test('chặn xóa danh mục đang có khóa học', async (t) => {
  let deleteCalled = false;
  stubMethods(t, catalogRepository, {
    findCategoryById: async () => ({ id: 2, name: 'Lập trình Web' }),
    countCoursesInCategory: async () => 2,
    deleteEmptyCategory: async () => {
      deleteCalled = true;
      return true;
    }
  });

  await assert.rejects(
    catalogService.deleteCategory('2'),
    (error) => error.statusCode === 409 && /đang có 2 khóa học/.test(error.message)
  );
  assert.equal(deleteCalled, false);
});

test('xóa được danh mục trống', async (t) => {
  stubMethods(t, catalogRepository, {
    findCategoryById: async () => ({ id: 9, name: 'Trống' }),
    countCoursesInCategory: async () => 0,
    deleteEmptyCategory: async () => true
  });

  const deleted = await catalogService.deleteCategory('9');
  assert.equal(deleted.name, 'Trống');
});

test('tạo danh mục: bắt buộc có tên và không trùng tên', async (t) => {
  let created;
  stubMethods(t, catalogRepository, {
    findCategoryByName: async (name) => (name.toLowerCase() === 'cơ sở dữ liệu' ? { id: 4, name: 'Cơ sở dữ liệu' } : null),
    createCategory: async (name) => {
      created = name;
      return { id: 10, name, courseCount: 0 };
    }
  });

  await assert.rejects(catalogService.createCategory({ name: '   ' }), (error) => error.statusCode === 400);
  await assert.rejects(catalogService.createCategory({ name: 'CƠ SỞ DỮ LIỆU' }), (error) => error.statusCode === 409);

  const category = await catalogService.createCategory({ name: '  Cấu trúc   dữ liệu ' });
  assert.equal(created, 'Cấu trúc dữ liệu');
  assert.equal(category.id, 10);
});

test('ẩn và bỏ ẩn khóa học đúng trạng thái', async (t) => {
  const calls = [];
  let status = 'draft';
  stubMethods(t, catalogRepository, {
    findCourseStatusById: async (id) => ({ id, title: 'Khóa A', status }),
    hideCourse: async (id) => {
      calls.push(['hide', id]);
      status = 'hidden';
      return true;
    },
    unhideCourse: async (id) => {
      calls.push(['unhide', id]);
      status = 'draft';
      return true;
    }
  });

  assert.equal((await catalogService.setCourseHidden('3', true)).status, 'hidden');
  await assert.rejects(catalogService.setCourseHidden('3', true), (error) => error.statusCode === 409);
  assert.equal((await catalogService.setCourseHidden('3', false)).status, 'draft');
  assert.deepEqual(calls, [['hide', 3], ['unhide', 3]]);
  await assert.rejects(catalogService.setCourseHidden('abc', true), (error) => error.statusCode === 400);
});

test('giảng viên không tự bỏ ẩn khóa học bị quản trị viên ẩn', async (t) => {
  let saved;
  stubMethods(t, courseRepository, {
    findById: async () => ({ id: 6, user_id: 3, title: 'A', status: 'hidden' }),
    update: async (_id, data) => {
      saved = data;
    }
  });

  await courseService.updateCourse(3, 6, { status: 'public', title: 'B' }, 'teacher');
  assert.equal(saved.status, 'hidden');
  assert.equal(saved.title, 'B');
});

test('khóa học bị ẩn trả 404 với người không sở hữu', async (t) => {
  stubMethods(t, courseRepository, {
    findDetailById: async () => ({ id: 6, teacherId: 3, status: 'hidden' }),
    findLessonSummariesByCourseId: async () => []
  });

  await assert.rejects(courseService.getCourseById(6, 5), (error) => error.statusCode === 404);
  const own = await courseService.getCourseById(6, 3);
  assert.equal(own.id, 6);
});

test('API danh mục / duyệt khóa học chỉ dành cho quản trị viên', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminCatalogRoutes);

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
  const routes = [
    { method: 'GET', path: '/api/admin/categories' },
    { method: 'POST', path: '/api/admin/categories', body: { name: 'X' } },
    { method: 'PUT', path: '/api/admin/categories/1', body: { name: 'X' } },
    { method: 'DELETE', path: '/api/admin/categories/1' },
    { method: 'GET', path: '/api/admin/courses' },
    { method: 'PATCH', path: '/api/admin/courses/1/hide' },
    { method: 'PATCH', path: '/api/admin/courses/1/unhide' }
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
    assert.equal((await request()).status, 401, `${route.method} ${route.path} cần đăng nhập`);
    assert.equal((await request(teacherToken)).status, 403, `${route.method} ${route.path} chỉ cho admin`);
  }
});

test('danh sách khóa học công khai loại bỏ khóa học bị ẩn', async (t) => {
  const { pool } = require('../src/config/db');
  const queries = [];
  stubMethods(t, pool, {
    query: async (sql) => {
      queries.push(sql.replace(/\s+/g, ' '));
      return sql.includes('COUNT(*) AS total') ? [[{ total: 0 }]] : [[]];
    }
  });

  await courseRepository.findPage({ page: 1, limit: 9 });
  assert.match(queries[0], /WHERE c\.status <> 'hidden'/);
  assert.match(queries[1], /WHERE c\.status <> 'hidden'/);
});
