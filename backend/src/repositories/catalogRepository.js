// AI-assisted [AI-07]
const { pool } = require('../config/db');

const findCategories = async () => {
  const [rows] = await pool.query(
    'SELECT id, name FROM categories ORDER BY name ASC'
  );
  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
};

const findTeachers = async () => {
  const [rows] = await pool.query(
    "SELECT id, name FROM users WHERE role = 'teacher' ORDER BY name ASC"
  );
  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
};

// ===== HT-15: Quản lý danh mục (quản trị viên) =====
const findCategoriesWithCourseCount = async () => {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, COUNT(course.id) AS courseCount
     FROM categories AS c
     LEFT JOIN courses AS course ON course.category_id = c.id
     GROUP BY c.id, c.name
     ORDER BY c.id ASC`
  );
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    courseCount: Number(row.courseCount)
  }));
};

const findCategoryById = async (id) => {
  const [rows] = await pool.query('SELECT id, name FROM categories WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? { id: Number(rows[0].id), name: rows[0].name } : null;
};

// So khớp không phân biệt hoa thường để chặn tạo trùng tên
const findCategoryByName = async (name) => {
  const [rows] = await pool.query(
    'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [name]
  );
  return rows[0] ? { id: Number(rows[0].id), name: rows[0].name } : null;
};

const createCategory = async (name) => {
  const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return { id: Number(result.insertId), name, courseCount: 0 };
};

const updateCategory = async (id, name) => {
  const [result] = await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows > 0;
};

const countCoursesInCategory = async (id) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM courses WHERE category_id = ?',
    [id]
  );
  return Number(rows[0].total);
};

const countPublicLessons = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM lessons
     WHERE course_id = ? AND status = 'public'`,
    [courseId]
  );
  return Number(rows[0].total);
};

// Chỉ xóa khi danh mục không còn khóa học (khóa ngoại courses.category_id đang ON DELETE CASCADE)
const deleteEmptyCategory = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM categories
     WHERE id = ?
       AND NOT EXISTS (SELECT 1 FROM courses WHERE category_id = ?)`,
    [id, id]
  );
  return result.affectedRows > 0;
};

// ===== HT-15: Duyệt khóa học (quản trị viên) =====
const findAllCoursesForAdmin = async () => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.title,
       c.status,
       c.category_id AS categoryId,
       category.name AS categoryName,
       c.user_id AS teacherId,
       teacher.name AS teacherName,
       teacher.avatar AS teacherAvatar
     FROM courses AS c
     LEFT JOIN categories AS category ON category.id = c.category_id
     LEFT JOIN users AS teacher ON teacher.id = c.user_id
     ORDER BY c.id ASC`
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    categoryId: Number(row.categoryId),
    teacherId: Number(row.teacherId)
  }));
};

const findCourseStatusById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, title, status FROM courses WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? { ...rows[0], id: Number(rows[0].id) } : null;
};

// Ẩn khóa học bằng cách đổi trực tiếp trạng thái
const hideCourse = async (id) => {
  const [result] = await pool.query(
    `UPDATE courses
     SET status = 'hidden'
     WHERE id = ? AND status <> 'hidden'`,
    [id]
  );
  return result.affectedRows > 0;
};

// Bỏ ẩn thì công khai khóa học trở lại
const unhideCourse = async (id) => {
  const [result] = await pool.query(
    `UPDATE courses
     SET status = 'public'
     WHERE id = ? AND status = 'hidden'`,
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  findCategories,
  findTeachers,
  findCategoriesWithCourseCount,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  countCoursesInCategory,
  countPublicLessons,
  deleteEmptyCategory,
  findAllCoursesForAdmin,
  findCourseStatusById,
  hideCourse,
  unhideCourse
};
