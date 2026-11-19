const { pool } = require('../config/db');

const create = async (userId, courseId) => {
  try {
    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );
    return true;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return false;
    throw error;
  }
};

const exists = async (userId, courseId) => {
  const [rows] = await pool.query(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
    [userId, courseId]
  );
  return rows.length > 0;
};

module.exports = { create, exists };
