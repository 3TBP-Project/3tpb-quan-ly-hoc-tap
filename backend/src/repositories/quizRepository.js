// AI-assisted [AI-04]
const { pool } = require('../config/db');

const findCourseById = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT id, title, status, quiz_minutes AS quiz_duration FROM courses WHERE id = ? LIMIT 1',
    [courseId]
  );
  return rows[0] || null;
};

const getQuestionsByCourseId = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT id, course_id, content, correct_answer, false_answer,
            false_answer_2, false_answer_3
     FROM questions
     WHERE course_id = ?
     ORDER BY id ASC`,
    [courseId]
  );
  return rows;
};

const createAttemptWithLock = async ({ userId, courseId, startedAt, maxAttempts }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [enrollments] = await connection.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? FOR UPDATE',
      [userId, courseId]
    );

    if (enrollments.length === 0) {
      const err = new Error('Bạn cần ghi danh khóa học trước khi làm bài trắc nghiệm.');
      err.statusCode = 403;
      throw err;
    }

    const [countRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM quiz_attempts WHERE user_id = ? AND course_id = ? AND started_at IS NOT NULL',
      [userId, courseId]
    );
    const attemptCount = Number(countRows[0].total);

    if (attemptCount >= maxAttempts) {
      const err = new Error(`Bạn đã sử dụng hết tối đa ${maxAttempts} lượt làm bài cho khóa học này.`);
      err.statusCode = 403;
      throw err;
    }

    const [result] = await connection.query(
      `INSERT INTO quiz_attempts
       (user_id, course_id, score, status, started_at, submitted_at)
       VALUES (?, ?, NULL, 'doing', ?, NULL)`,
      [userId, courseId, startedAt]
    );

    await connection.commit();

    return {
      attempt: {
        id: result.insertId,
        user_id: userId,
        course_id: courseId,
        score: null,
        started_at: startedAt,
        submitted_at: null
      },
      attemptNumber: attemptCount + 1
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const findAttemptById = async (attemptId) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, course_id, score, started_at, submitted_at FROM quiz_attempts WHERE id = ? LIMIT 1',
    [attemptId]
  );
  return rows[0] || null;
};

const updateAttemptResultIfNotSubmitted = async (attemptId, userId, { score, submitted_at }) => {
  const [result] = await pool.query(
    `UPDATE quiz_attempts
     SET score = ?, status = 'submitted', submitted_at = ?
     WHERE id = ? AND user_id = ? AND submitted_at IS NULL`,
    [score, submitted_at, attemptId, userId]
  );
  return result.affectedRows > 0;
};

const getBestScore = async (userId, courseId) => {
  const [rows] = await pool.query(
    'SELECT MAX(score) AS best_score FROM quiz_attempts WHERE user_id = ? AND course_id = ? AND submitted_at IS NOT NULL',
    [userId, courseId]
  );
  return rows[0].best_score !== null ? Number(rows[0].best_score) : 0;
};

module.exports = {
  findCourseById,
  getQuestionsByCourseId,
  createAttemptWithLock,
  findAttemptById,
  updateAttemptResultIfNotSubmitted,
  getBestScore
};