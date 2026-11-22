const { pool } = require('../config/db');

const findCourseById = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT id, title, user_id FROM courses WHERE id = ? LIMIT 1',
    [courseId]
  );
  return rows[0] || null;
};

const findById = async (lessonId) => {
  const [rows] = await pool.query(
    'SELECT id, course_id, title, content, video_path, file_path, position FROM lessons WHERE id = ? LIMIT 1',
    [lessonId]
  );
  return rows[0] || null;
};

const findSummariesByCourseId = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT id, course_id AS courseId, position AS \`order\`, position, title, content, video_path, file_path
     FROM lessons
     WHERE course_id = ?
     ORDER BY position ASC, id ASC`,
    [courseId]
  );
  return rows.map((lesson) => ({
    ...lesson,
    id: Number(lesson.id),
    courseId: Number(lesson.courseId),
    order: Number(lesson.order),
    position: Number(lesson.position)
  }));
};

const create = async ({ courseId, title, content, videoPath, filePath, position }) => {
  const [result] = await pool.query(
    `INSERT INTO lessons (course_id, title, content, video_path, file_path, position)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [courseId, title, content, videoPath, filePath, position]
  );
  return result.insertId;
};

const update = async (lessonId, { title, content, videoPath, filePath, position }) => {
  const [result] = await pool.query(
    `UPDATE lessons
     SET title = ?, content = ?, video_path = ?, file_path = ?, position = ?
     WHERE id = ?`,
    [title, content, videoPath, filePath, position, lessonId]
  );
  return result.affectedRows > 0;
};

// Bài học khác trong cùng khóa đang giữ vị trí này (bỏ qua chính bài đang sửa)
const findByPosition = async (courseId, position, excludeLessonId = null) => {
  const [rows] = await pool.query(
    `SELECT id, title, position FROM lessons
     WHERE course_id = ? AND position = ? AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [courseId, position, excludeLessonId, excludeLessonId]
  );
  return rows[0] || null;
};

const findMaxPosition = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT COALESCE(MAX(position), 0) AS maxPosition FROM lessons WHERE course_id = ?',
    [courseId]
  );
  return Number(rows[0]?.maxPosition) || 0;
};

const updateFilePath = async (lessonId, filePath) => {
  const [result] = await pool.query(
    'UPDATE lessons SET file_path = ? WHERE id = ?',
    [filePath, lessonId]
  );
  return result.affectedRows > 0;
};

// Hoán đổi vị trí hai bài học trong một giao dịch
const swapPositions = async (lessonA, lessonB) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('UPDATE lessons SET position = ? WHERE id = ?', [lessonB.position, lessonA.id]);
    await connection.query('UPDATE lessons SET position = ? WHERE id = ?', [lessonA.position, lessonB.id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const remove = async (lessonId) => {
  const [result] = await pool.query('DELETE FROM lessons WHERE id = ?', [lessonId]);
  return result.affectedRows > 0;
};

const findByCourseIdWithProgress = async (courseId, userId) => {
  const [rows] = await pool.query(
    `SELECT
       l.id,
       l.position AS \`order\`,
       l.title,
       l.content,
       l.video_path AS videoUrl,
       l.file_path AS fileUrl,
       COALESCE(lp.is_completed, 0) AS isCompleted
     FROM lessons AS l
     LEFT JOIN lesson_progress AS lp
       ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE l.course_id = ?
     ORDER BY l.position ASC, l.id ASC`,
    [userId, courseId]
  );

  return rows.map((lesson) => ({
    ...lesson,
    id: Number(lesson.id),
    order: Number(lesson.order),
    isCompleted: Boolean(lesson.isCompleted)
  }));
};

const markCompleted = async (userId, lessonId) => {
  await pool.query(
    `INSERT INTO lesson_progress (user_id, lesson_id, is_completed)
     VALUES (?, ?, TRUE)
     ON DUPLICATE KEY UPDATE is_completed = TRUE`,
    [userId, lessonId]
  );
};

module.exports = {
  findCourseById,
  findById,
  findSummariesByCourseId,
  create,
  update,
  findByPosition,
  findMaxPosition,
  updateFilePath,
  swapPositions,
  remove,
  findByCourseIdWithProgress,
  markCompleted
};
