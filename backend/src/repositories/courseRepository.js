/**
 * Repository xử lý thao tác cơ sở dữ liệu cho bảng courses
 */
const db = require('../config/db'); // Đường dẫn đến file cấu hình kết nối DB của bạn

class CourseRepository {
  
  // ==========================================
  // 1. CREATE - Thêm khóa học mới
  // ==========================================
  async create(courseData) {
    const { title, description, category_id, user_id, price_course, quiz_minutes, thumbnail, status } = courseData;
    const [result] = await db.query(
      `INSERT INTO courses (title, description, category_id, user_id, price_course, quiz_minutes, thumbnail, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category_id, user_id, price_course, quiz_minutes || null, thumbnail || null, status || 'draft']
    );
    return result.insertId;
  }

  // ==========================================
  // 2. READ - Lấy danh sách khóa học theo giảng viên (user_id)
  // ==========================================
  async findByTeacherId(userId) {
    const [rows] = await db.query(
      `SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC`, 
      [userId]
    );
    return rows;
  }

  // ==========================================
  // 3. READ - Lấy chi tiết một khóa học theo id
  // ==========================================
  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM courses WHERE id = ?`, 
      [id]
    );
    return rows[0];
  }

  // ==========================================
  // 4. UPDATE - Cập nhật thông tin khóa học
  // ==========================================
  async update(id, courseData) {
    const { title, description, category_id, price_course, quiz_minutes, thumbnail, status } = courseData;
    const [result] = await db.query(
      `UPDATE courses 
       SET title = ?, description = ?, category_id = ?, price_course = ?, quiz_minutes = ?, thumbnail = ?, status = ? 
       WHERE id = ?`,
      [title, description, category_id, price_course, quiz_minutes, thumbnail, status, id]
    );
    return result.affectedRows;
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học theo id
  // ==========================================
  async remove(id) {
    const [result] = await db.query(
      `DELETE FROM courses WHERE id = ?`, 
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new CourseRepository();
//AI-assisted: <Gemini> [AI-01]