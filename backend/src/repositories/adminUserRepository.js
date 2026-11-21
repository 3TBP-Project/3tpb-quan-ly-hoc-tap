// AI-assisted [AI-08]
// HT-14: truy vấn quản lý người dùng (học viên, giảng viên) cho quản trị viên
const { pool } = require('../config/db');

const MANAGED_ROLES = ['student', 'teacher'];

// Số khóa: học viên = số khóa đã ghi danh, giảng viên = số khóa đang giảng dạy
const SELECT_USER = `
  SELECT
    u.id, u.name, u.email, u.role, u.avatar, u.is_locked, u.created_at,
    CASE
      WHEN u.role = 'teacher' THEN (SELECT COUNT(*) FROM courses AS c WHERE c.user_id = u.id)
      ELSE (SELECT COUNT(*) FROM enrollments AS e WHERE e.user_id = u.id)
    END AS courses
  FROM users AS u`;

const toUser = (row) => ({
  id: Number(row.id),
  name: row.name,
  email: row.email,
  role: row.role,
  avatar: row.avatar ?? null,
  courses: Number(row.courses ?? 0),
  status: Number(row.is_locked) === 1 ? 'locked' : 'active',
  createdAt: row.created_at ?? null
});

const buildFilter = ({ role, search }) => {
  const conditions = ['u.role IN (?)'];
  const params = [role && role !== 'all' ? [role] : MANAGED_ROLES];
  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  return { where: `WHERE ${conditions.join(' AND ')}`, params };
};

const findPage = async ({ role, search, page, limit }) => {
  const { where, params } = buildFilter({ role, search });
  const [rows] = await pool.query(
    `${SELECT_USER}
     ${where}
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM users AS u ${where}`, params);
  return { users: rows.map(toUser), total: Number(countRows[0].total) };
};

// Đếm theo vai trò (không phụ thuộc ô tìm kiếm) cho menu chọn vai trò
const countByRole = async () => {
  const [rows] = await pool.query(
    'SELECT role, COUNT(*) AS total FROM users WHERE role IN (?) GROUP BY role',
    [MANAGED_ROLES]
  );
  const counts = { all: 0, student: 0, teacher: 0 };
  for (const row of rows) {
    counts[row.role] = Number(row.total);
    counts.all += Number(row.total);
  }
  return counts;
};

const findById = async (id) => {
  const [rows] = await pool.query(`${SELECT_USER} WHERE u.id = ? LIMIT 1`, [id]);
  return rows[0] ? toUser(rows[0]) : null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT id, email FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] ? { id: Number(rows[0].id), email: rows[0].email } : null;
};

const createTeacher = async ({ name, email, passwordHash }) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, is_locked, status)
       VALUES (?, ?, ?, 'teacher', 0, 'active')`,
      [name, email, passwordHash]
    );
    return Number(result.insertId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const conflict = new Error('Email này đã được sử dụng.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
};

const updateName = async (id, name) => {
  const [result] = await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows > 0;
};

const setLocked = async (id, isLocked) => {
  const [result] = await pool.query('UPDATE users SET is_locked = ? WHERE id = ?', [isLocked ? 1 : 0, id]);
  return result.affectedRows > 0;
};

// Chỉ xóa giảng viên chưa có khóa học (khóa ngoại courses.user_id đang ON DELETE CASCADE)
const deleteTeacherWithoutCourses = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM users
     WHERE id = ? AND role = 'teacher'
       AND NOT EXISTS (SELECT 1 FROM courses WHERE user_id = ?)`,
    [id, id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  MANAGED_ROLES,
  findPage,
  countByRole,
  findById,
  findByEmail,
  createTeacher,
  updateName,
  setLocked,
  deleteTeacherWithoutCourses
};
