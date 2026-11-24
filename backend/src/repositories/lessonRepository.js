const { pool } = require('../config/db');

// Thứ tự học: theo thứ tự chương, rồi tới thứ tự bài trong chương.
// Bài chưa thuộc chương nào (chapter_id NULL) xếp cuối khóa học.
const NO_CHAPTER = 2147483647;
const LESSON_ORDER_KEY = `COALESCE(ch.position, ${NO_CHAPTER}), COALESCE(ch.id, ${NO_CHAPTER}), l.position, l.id`;

const findCourseById = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT id, title, user_id, status FROM courses WHERE id = ? LIMIT 1',
    [courseId]
  );
  return rows[0] || null;
};

const findById = async (lessonId) => {
  const [rows] = await pool.query(
    `SELECT l.id, l.course_id, l.chapter_id, l.title, l.content, l.video_path, l.file_path,
            l.position, l.status, c.status AS course_status
     FROM lessons AS l
     JOIN courses AS c ON c.id = l.course_id
     WHERE l.id = ? LIMIT 1`,
    [lessonId]
  );
  return rows[0] || null;
};

const findSummariesByCourseId = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT l.id, l.course_id AS courseId, l.chapter_id AS chapterId,
            l.position AS \`order\`, l.position, l.title, l.content,
            l.video_path, l.file_path, l.status
     FROM lessons AS l
     LEFT JOIN chapters AS ch ON ch.id = l.chapter_id
     WHERE l.course_id = ?
     ORDER BY ${LESSON_ORDER_KEY}`,
    [courseId]
  );
  return rows.map((lesson) => ({
    ...lesson,
    id: Number(lesson.id),
    courseId: Number(lesson.courseId),
    chapterId: lesson.chapterId == null ? null : Number(lesson.chapterId),
    order: Number(lesson.order),
    position: Number(lesson.position)
  }));
};

const create = async ({ courseId, chapterId = null, title, content, videoPath, filePath, position, status }) => {
  const [result] = await pool.query(
    `INSERT INTO lessons
       (course_id, chapter_id, title, content, video_path, file_path, position, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [courseId, chapterId, title, content, videoPath, filePath, position, status]
  );
  return result.insertId;
};

const update = async (lessonId, { chapterId = null, title, content, videoPath, filePath, position, status }) => {
  const [result] = await pool.query(
    `UPDATE lessons
     SET chapter_id = ?, title = ?, content = ?, video_path = ?, file_path = ?, position = ?, status = ?
     WHERE id = ?`,
    [chapterId, title, content, videoPath, filePath, position, status, lessonId]
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

// HT-10: đổi nhanh trạng thái bài học (draft / public)
const updateStatus = async (lessonId, status) => {
  const [result] = await pool.query(
    'UPDATE lessons SET status = ? WHERE id = ?',
    [status, lessonId]
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
       l.chapter_id AS chapterId,
       l.position AS \`order\`,
       l.title,
       l.content,
       l.video_path AS videoUrl,
       l.file_path AS fileUrl,
       COALESCE(lp.is_completed, 0) AS isCompleted
     FROM lessons AS l
     LEFT JOIN chapters AS ch ON ch.id = l.chapter_id
     LEFT JOIN lesson_progress AS lp
       ON lp.lesson_id = l.id AND lp.user_id = ?
     WHERE l.course_id = ? AND l.status = 'public'
     ORDER BY ${LESSON_ORDER_KEY}`,
    [userId, courseId]
  );

  return rows.map((lesson) => ({
    ...lesson,
    id: Number(lesson.id),
    chapterId: lesson.chapterId == null ? null : Number(lesson.chapterId),
    order: Number(lesson.order),
    isCompleted: Boolean(lesson.isCompleted)
  }));
};

// Học tuần tự: đếm số bài công khai đứng trước bài này (theo thứ tự chương rồi tới
// thứ tự bài) mà học viên chưa hoàn thành. Khác 0 nghĩa là bài này đang bị khóa.
const countIncompletePrevious = async (userId, lesson) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM lessons AS l
     LEFT JOIN chapters AS ch ON ch.id = l.chapter_id
     JOIN (
       SELECT COALESCE(tch.position, ${NO_CHAPTER}) AS chapterPos,
              COALESCE(tch.id, ${NO_CHAPTER}) AS chapterId,
              t.position AS lessonPos,
              t.id AS lessonId
       FROM lessons AS t
       LEFT JOIN chapters AS tch ON tch.id = t.chapter_id
       WHERE t.id = ?
     ) AS cur
     LEFT JOIN lesson_progress AS lp
       ON lp.lesson_id = l.id AND lp.user_id = ? AND lp.is_completed = 1
     WHERE l.course_id = ? AND l.status = 'public'
       AND (${LESSON_ORDER_KEY}) < (cur.chapterPos, cur.chapterId, cur.lessonPos, cur.lessonId)
       AND lp.lesson_id IS NULL`,
    [lesson.id, userId, lesson.course_id]
  );
  return Number(rows[0]?.total) || 0;
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
  updateStatus,
  swapPositions,
  remove,
  findByCourseIdWithProgress,
  countIncompletePrevious,
  markCompleted
};
