const { pool } = require('../config/db');

class EnrollmentRepository {
  async findByStudentAndCourse(userId, courseId) {
    const [rows] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
      [userId, courseId]
    );
    return rows[0] || null;
  }

  async create(userId, courseId) {
    const [result] = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );
    return result.insertId;
  }

  async findCoursesByStudent(userId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.title, c.description, c.thumbnail, c.price_course,
              c.status, c.category_id, cat.name AS categoryName,
              u.name AS teacherName, e.id AS enrollmentId
       FROM enrollments e
       INNER JOIN courses c ON c.id = e.course_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       LEFT JOIN users u ON u.id = c.user_id
       WHERE e.user_id = ?
       ORDER BY e.id DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = new EnrollmentRepository();
