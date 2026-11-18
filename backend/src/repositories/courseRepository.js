/**
 * Repository xử lý thao tác cơ sở dữ liệu cho bảng courses
 * Sử dụng thư viện kết nối MySQL thuần (hoặc Query Builder phù hợp trong dự án)
 */
const { pool } = require('../config/db');

class CourseRepository {
  
  // ==========================================
  // 1. CREATE - Thêm khóa học mới
  // ==========================================
  async create(courseData) {
    const { title, description, category_id, user_id, price_course, quiz_duration } = courseData;
    const [result] = await pool.query(
      `INSERT INTO courses (title, description, category_id, user_id, price_course, quiz_duration) 
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
       SET title = ?, description = ?, category_id = ?, price_course = ?, quiz_duration = ? 
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