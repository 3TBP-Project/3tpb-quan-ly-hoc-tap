const { pool } = require('../config/db');

class EnrollmentRepository {
  async findCourseById(courseId) {
    const [rows] = await pool.query(
      'SELECT id, title, status FROM courses WHERE id = ? LIMIT 1',
      [courseId]
    );
    return rows[0] || null;
  }

  async findByStudentAndCourse(studentId, courseId) {
    const [rows] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
      [studentId, courseId]
    );
    return rows[0] || null;
  }

  async create(studentId, courseId) {
    const [result] = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [studentId, courseId]
    );
    return result.insertId;
  }

  async exists(studentId, courseId) {
    const [rows] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1',
      [studentId, courseId]
    );
    return rows.length > 0;
  }

  async findCoursesByStudent(studentId) {
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.thumbnail AS coverImage,
         u.name AS teacherName,
         c.category_id AS categoryId,
         category.name AS categoryName,
         COUNT(DISTINCT lesson.id) AS lessonCount,
         enrollment.id AS enrollmentId
       FROM enrollments AS enrollment
       INNER JOIN courses AS c ON c.id = enrollment.course_id
       LEFT JOIN users AS u ON u.id = c.user_id
       LEFT JOIN categories AS category ON category.id = c.category_id
       LEFT JOIN lessons AS lesson ON lesson.course_id = c.id
       WHERE enrollment.user_id = ?
       GROUP BY c.id, c.title, c.thumbnail, u.name, c.category_id,
                category.name, enrollment.id
       ORDER BY enrollment.id DESC`,
      [studentId]
    );

    return rows.map((course) => ({
      ...course,
      id: Number(course.id),
      categoryId: Number(course.categoryId),
      lessonCount: Number(course.lessonCount)
    }));
  }
}

module.exports = new EnrollmentRepository();
