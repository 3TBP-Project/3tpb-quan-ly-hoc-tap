// AI-assisted
// Chương học (chapters): mỗi khóa học chia thành nhiều chương, mỗi chương chứa nhiều bài học.
const { pool } = require('../config/db');

const toChapter = (row) => ({
  id: Number(row.id),
  courseId: Number(row.course_id),
  title: row.title,
  position: Number(row.position)
});

const findByCourseId = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT id, course_id, title, position
     FROM chapters
     WHERE course_id = ?
     ORDER BY position ASC, id ASC`,
    [courseId]
  );
  return rows.map(toChapter);
};

const findById = async (chapterId) => {
  const [rows] = await pool.query(
    'SELECT id, course_id, title, position FROM chapters WHERE id = ? LIMIT 1',
    [chapterId]
  );
  return rows[0] ? toChapter(rows[0]) : null;
};

const findMaxPosition = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT COALESCE(MAX(position), 0) AS maxPosition FROM chapters WHERE course_id = ?',
    [courseId]
  );
  return Number(rows[0]?.maxPosition) || 0;
};

const create = async ({ courseId, title, position }) => {
  const [result] = await pool.query(
    'INSERT INTO chapters (course_id, title, position) VALUES (?, ?, ?)',
    [courseId, title, position]
  );
  return result.insertId;
};

const update = async (chapterId, { title, position }) => {
  const [result] = await pool.query(
    'UPDATE chapters SET title = ?, position = ? WHERE id = ?',
    [title, position, chapterId]
  );
  return result.affectedRows > 0;
};

// Hoán đổi thứ tự hai chương trong một giao dịch (nút lên / xuống)
const swapPositions = async (chapterA, chapterB) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('UPDATE chapters SET position = ? WHERE id = ?', [chapterB.position, chapterA.id]);
    await connection.query('UPDATE chapters SET position = ? WHERE id = ?', [chapterA.position, chapterB.id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Khóa ngoại lessons.chapter_id để ON DELETE CASCADE, xóa thẳng sẽ xóa luôn bài học.
// Vì vậy tách các bài học ra khỏi chương (chapter_id = NULL) trước rồi mới xóa chương.
const removeKeepingLessons = async (chapterId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [detached] = await connection.query(
      'UPDATE lessons SET chapter_id = NULL WHERE chapter_id = ?',
      [chapterId]
    );
    await connection.query('DELETE FROM chapters WHERE id = ?', [chapterId]);
    await connection.commit();
    return detached.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  findByCourseId,
  findById,
  findMaxPosition,
  create,
  update,
  swapPositions,
  removeKeepingLessons
};
