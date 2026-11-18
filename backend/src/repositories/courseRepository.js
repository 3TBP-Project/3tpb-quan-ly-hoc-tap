// AI-assisted [AI-05]
const { pool } = require('../config/db');

/**
 * Repository xử lý thao tác cơ sở dữ liệu cho bảng courses
 * Sử dụng thư viện kết nối MySQL thuần (hoặc Query Builder phù hợp trong dự án)
 */

class CourseRepository {

  async findPage({ page, limit }) {
    const offset = (page - 1) * limit;
    const [courses] = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.user_id AS teacherId,
         u.name AS teacherName,
         c.category_id AS categoryId,
         category.name AS categoryName,
         COUNT(lesson.id) AS lessonCount,
         '/images/course-default.jpg' AS coverImage
       FROM courses AS c
       LEFT JOIN users AS u ON u.id = c.user_id
       LEFT JOIN categories AS category ON category.id = c.category_id
       LEFT JOIN lessons AS lesson ON lesson.course_id = c.id
       GROUP BY
         c.id,
         c.title,
         c.user_id,
         u.name,
         c.category_id,
         category.name
       ORDER BY c.id ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM courses'
    );

    return {
      courses: courses.map((course) => ({
        ...course,
        id: Number(course.id),
        teacherId: Number(course.teacherId),
        categoryId: Number(course.categoryId),
        lessonCount: Number(course.lessonCount)
      })),
      total: Number(countRows[0].total)
    };
  }

  // ==========================================
  // 1. CREATE - Thêm khóa học mới
  // ==========================================
  async create(courseData) {
    const { title, description, category_id, user_id, price_course, quiz_duration } = courseData;
    const [result] = await pool.query(
      `INSERT INTO courses (title, description, category_id, user_id, price_course, quiz_minutes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, category_id, user_id, price_course, quiz_duration]
    );
    return result.insertId;
  }

  // ==========================================
  // 2. READ - Lấy danh sách khóa học theo giảng viên (user_id)
  // ==========================================
  async findByTeacherId(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM courses WHERE user_id = ?`,
      [userId]
    );
    return rows;
  }

  // ==========================================
  // 3. READ - Lấy chi tiết một khóa học theo id
  // ==========================================
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM courses WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // ==========================================
  // 4. UPDATE - Cập nhật thông tin khóa học
  // ==========================================
  async update(id, courseData) {
    const { title, description, category_id, price_course, quiz_duration } = courseData;
    const [result] = await pool.query(
      `UPDATE courses
       SET title = ?, description = ?, category_id = ?, price_course = ?, quiz_minutes = ?
       WHERE id = ?`,
      [title, description, category_id, price_course, quiz_duration, id]
    );
    return result.affectedRows;
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học theo id
  // ==========================================
  async remove(id) {
    const [result] = await pool.query(
      `DELETE FROM courses WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new CourseRepository();
