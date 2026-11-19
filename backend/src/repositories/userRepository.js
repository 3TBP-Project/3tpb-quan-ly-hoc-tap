// AI-assisted [AI-02] [AI-15]
const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, password, role, is_locked FROM users WHERE email = ? LIMIT 1',
    [email]
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

// ===== Quản lý người dùng (HT-14) =====
// Trang quản trị chỉ quản lý học viên và giảng viên, không liệt kê tài khoản admin.
const MANAGED_ROLES = ['student', 'teacher'];

// Số khóa: học viên = số khóa đã ghi danh, giảng viên = số khóa đang giảng dạy.
const COURSE_COUNT_SQL = `
  CASE
    WHEN u.role = 'teacher' THEN (SELECT COUNT(*) FROM courses c WHERE c.user_id = u.id)
    ELSE (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id)
  END`;

const PUBLIC_COLUMNS = `
  u.id, u.avatar, u.name, u.email, u.role, u.is_locked, u.created_at,
  ${COURSE_COUNT_SQL} AS courses`;

const buildFilters = ({ role, search }) => {
  const conditions = ['u.role IN (?)'];
  const params = [role ? [role] : MANAGED_ROLES];

  if (search) {
    // So khớp không phân biệt dấu để gõ "nguyen" vẫn ra "Nguyễn"
    conditions.push('(u.name COLLATE utf8mb4_unicode_ci LIKE ? OR u.email LIKE ?)');
    const keyword = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    params.push(keyword, keyword);
  }

  return { where: conditions.join(' AND '), params };
};

const findPage = async ({ role, search, page, limit }) => {
  const { where, params } = buildFilters({ role, search });

  const [rows] = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}
       FROM users u
      WHERE ${where}
      ORDER BY u.created_at DESC, u.id DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users u WHERE ${where}`,
    params
  );

  return { users: rows, total: Number(total) };
};

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

const findPublicById = async (id) => {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users u WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// Danh sách khóa học hiển thị trong hồ sơ người dùng
const findCoursesOfUser = async (user) => {
  const sql = user.role === 'teacher'
    ? 'SELECT c.id, c.title, c.status FROM courses c WHERE c.user_id = ? ORDER BY c.id DESC'
    : `SELECT c.id, c.title, c.status
         FROM enrollments e JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = ? ORDER BY e.id DESC`;
  const [rows] = await pool.query(sql, [user.id]);
  return rows;
};

const updateUser = async (id, { name, email, role, password_hash }) => {
  const fields = ['name = ?', 'email = ?', 'role = ?'];
  const params = [name, email, role];
  if (password_hash) {
    fields.push('password = ?');
    params.push(password_hash);
  }
  params.push(id);

  const [result] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows;
};

const setLocked = async (id, locked) => {
  const [result] = await pool.query('UPDATE users SET is_locked = ? WHERE id = ?', [locked ? 1 : 0, id]);
  return result.affectedRows;
};

module.exports = {
  findByEmail,
  createUser,
  MANAGED_ROLES,
  findPage,
  countByRole,
  findPublicById,
  findCoursesOfUser,
  updateUser,
  setLocked
};
