const db = require('../config/db');

class LessonRepository {
  async create(lessonData) {
    const { course_id, title, content, video_path, file_path, position } = lessonData;
    const [result] = await db.query(
      `INSERT INTO lessons (course_id, title, content, video_path, file_path, position)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_id, title, content || null, video_path || null, file_path || null, position]
    );
    return result.insertId;
  }

  async findByCourseId(courseId) {
    const [rows] = await db.query(
      `SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC, id ASC`,
      [courseId]
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM lessons WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async getMaxPosition(courseId) {
    const [rows] = await db.query(
      `SELECT COALESCE(MAX(position), 0) AS maxPos FROM lessons WHERE course_id = ?`,
      [courseId]
    );
    return Number(rows[0].maxPos) || 0;
  }

  async update(id, lessonData) {
    const { title, content, video_path, file_path, position } = lessonData;
    const [result] = await db.query(
      `UPDATE lessons
       SET title = ?, content = ?, video_path = ?, file_path = ?, position = ?
       WHERE id = ?`,
      [title, content, video_path, file_path, position, id]
    );
    return result.affectedRows;
  }

  async updatePosition(id, position) {
    const [result] = await db.query(
      `UPDATE lessons SET position = ? WHERE id = ?`,
      [position, id]
    );
    return result.affectedRows;
  }

  async remove(id) {
    const [result] = await db.query(
      `DELETE FROM lessons WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new LessonRepository();
//AI-assisted: <Gemini> [AI-02]