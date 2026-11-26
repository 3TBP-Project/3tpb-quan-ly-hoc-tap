// Giả lập API khóa học (lọc và phân trang như server) để dựng giao diện khi backend chưa có /api/courses.
// Trả về đúng dạng phản hồi của backend: { status, data }.
import { mockCourses } from './course';

const delay = (value, ms = 250) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const ok = (data) => ({ status: 'success', data });

const uniqueSorted = (items, idKey, nameKey) =>
  [...new Map(items.map((c) => [c[idKey], { id: c[idKey], name: c[nameKey] }])).values()].sort(
    (a, b) => a.name.localeCompare(b.name, 'vi'),
  );

export function mockGetCourses({ search = '', categoryId = '', teacherId = '', page = 1, limit = 9 } = {}) {
  const keyword = search.trim().toLowerCase();

  const filtered = mockCourses.filter(
    (c) =>
      (!keyword || c.title.toLowerCase().includes(keyword)) &&
      (!categoryId || c.categoryId === Number(categoryId)) &&
      (!teacherId || c.teacherId === Number(teacherId)),
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return delay(ok({ items: filtered.slice(start, start + limit), total, page, limit, totalPages }));
}

export const mockGetCategories = () =>
  delay(ok(uniqueSorted(mockCourses, 'categoryId', 'categoryName')));

export const mockGetTeachers = () =>
  delay(ok(uniqueSorted(mockCourses, 'teacherId', 'teacherName')));
