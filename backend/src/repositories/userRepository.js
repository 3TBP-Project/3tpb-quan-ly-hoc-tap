// AI-assisted [AI-02]
const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, password, role, is_locked FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

// Trạng thái đăng nhập mới nhất (dùng ở authMiddleware cho mọi request có token)
const findAuthStateById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, email, role, is_locked FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ name, email, password_hash, role }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, role]
  );
  return {
    id: result.insertId,
    name,
    email,
    role
  };
};

const findProfileById = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, avatar FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
};

const updateProfile = async (userId, { name, email }) => {
  try {
    await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const conflict = new Error('Email này đã được sử dụng.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
  return findProfileById(userId);
};

// HT-07: cập nhật đường dẫn ảnh đại diện
const updateAvatar = async (userId, avatarUrl) => {
  const [result] = await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);
  return result.affectedRows > 0;
};

// HT-07: lấy chuỗi băm mật khẩu để đối chiếu khi đổi mật khẩu
const findPasswordById = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, password FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
};

const updatePassword = async (userId, passwordHash) => {
  const [result] = await pool.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [passwordHash, userId]
  );
  return result.affectedRows > 0;
};

const listEnrolledCourses = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.title,
       c.description,
       COALESCE(c.thumbnail, '/images/course-default.jpg') AS coverImage,
       c.category_id AS categoryId,
       category.name AS categoryName,
       teacher.name AS teacherName,
       (SELECT COUNT(*) FROM lessons AS l
        WHERE l.course_id = c.id AND l.status = 'public') AS lessonCount
     FROM enrollments AS e
     JOIN courses AS c ON c.id = e.course_id
     LEFT JOIN categories AS category ON category.id = c.category_id
     LEFT JOIN users AS teacher ON teacher.id = c.user_id
     WHERE e.user_id = ? AND c.status = 'public'
     ORDER BY c.id DESC`,
    [userId]
  );
  return rows.map((course) => ({
    ...course,
    id: Number(course.id),
    categoryId: Number(course.categoryId),
    lessonCount: Number(course.lessonCount)
  }));
};

const listQuizHistory = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       qa.id AS attemptId,
       qa.course_id AS courseId,
       c.title AS courseTitle,
       qa.score,
       qa.status,
       qa.started_at AS startedAt,
       qa.submitted_at AS submittedAt
     FROM quiz_attempts AS qa
     JOIN courses AS c ON c.id = qa.course_id
     WHERE qa.user_id = ?
     ORDER BY qa.started_at DESC, qa.id DESC`,
    [userId]
  );
  return rows.map((attempt) => ({
    ...attempt,
    attemptId: Number(attempt.attemptId),
    courseId: Number(attempt.courseId),
    score: attempt.score === null ? null : Number(attempt.score)
  }));
};

const listUsers = async ({ limit, offset }) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, role, avatar, is_locked, status
     FROM users
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  return {
    users: rows.map((user) => ({ ...user, id: Number(user.id) })),
    total: Number(countRows[0].total)
  };
};

const setUserLocked = async (userId, isLocked) => {
  const [result] = await pool.query(
    'UPDATE users SET is_locked = ? WHERE id = ?',
    [isLocked, userId]
  );
  if (result.affectedRows > 0) return true;
  const [rows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows.length > 0;
};

const deleteUser = async (userId) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  return result.affectedRows > 0;
};

module.exports = {
  findByEmail,
  findAuthStateById,
  createUser,
  findProfileById,
  updateProfile,
  updateAvatar,
  findPasswordById,
  updatePassword,
  listEnrolledCourses,
  listQuizHistory,
  listUsers,
  setUserLocked,
  deleteUser
};