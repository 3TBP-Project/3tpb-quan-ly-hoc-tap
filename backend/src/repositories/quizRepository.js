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

// Lượt bỏ dở (đóng tab, mất mạng...) đã quá hạn nộp thì tự đóng: 0 điểm, trạng thái 'expired',
// thời điểm nộp = hết giờ làm bài. Nhờ vậy lượt này hiện trong lịch sử thay vì "mất tích"
// mà vẫn bị tính vào giới hạn số lượt. db: pool hoặc connection đang trong transaction.
const closeExpiredAttemptsWith = async (db, { userId, courseId = null, graceMinutes, now = new Date() }) => {
  const params = [userId];
  let courseFilter = '';
  if (courseId !== null) {
    courseFilter = 'AND qa.course_id = ?';
    params.push(courseId);
  }
  const [openRows] = await db.query(
    `SELECT qa.id, qa.started_at, c.quiz_minutes
     FROM quiz_attempts AS qa
     JOIN courses AS c ON c.id = qa.course_id
     WHERE qa.user_id = ? ${courseFilter}
       AND qa.submitted_at IS NULL AND qa.started_at IS NOT NULL`,
    params
  );

  let closed = 0;
  for (const row of openRows) {
    const minutes = Number(row.quiz_minutes);
    if (!Number.isFinite(minutes) || minutes <= 0) continue;
    const startedMs = new Date(row.started_at).getTime();
    if (now.getTime() <= startedMs + (minutes + graceMinutes) * 60 * 1000) continue;

    const [result] = await db.query(
      `UPDATE quiz_attempts
       SET score = 0, status = 'expired', submitted_at = ?
       WHERE id = ? AND submitted_at IS NULL`,
      [new Date(startedMs + minutes * 60 * 1000), row.id]
    );
    if (result.affectedRows === 0) continue;
    closed += 1;
    // Điền đáp án đúng để vẫn xem lại được lượt này (mọi câu tính là bỏ trống)
    await db.query(
      `UPDATE quiz_attempt_answers AS qaa
       JOIN questions AS q ON q.id = qaa.question_id
       SET qaa.correct_answer = q.correct_answer, qaa.is_correct = 0
       WHERE qaa.attempt_id = ? AND qaa.correct_answer IS NULL`,
      [row.id]
    );
  }
  return closed;
};

const closeExpiredAttempts = (options) => closeExpiredAttemptsWith(pool, options);

// Bắt đầu lượt làm bài trong một transaction:
// - Còn lượt đang làm dở và chưa hết giờ -> trả lại đúng lượt đó (resumed = true), không tốn lượt mới
// - Lượt dở đã quá giờ -> đóng (0 điểm) rồi mới đếm số lượt
// questions: [{ id, content, options }] – thứ tự lựa chọn đã xáo, lưu lại để làm tiếp / xem bài cũ
const createAttemptWithLock = async ({
  userId, courseId, startedAt, maxAttempts, questions = [], graceMinutes = 1
}) => {
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

    await closeExpiredAttemptsWith(connection, { userId, courseId, graceMinutes, now: startedAt });

    const [countRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM quiz_attempts WHERE user_id = ? AND course_id = ? AND started_at IS NOT NULL',
      [userId, courseId]
    );
    const attemptCount = Number(countRows[0].total);

    const [openRows] = await connection.query(
      `SELECT id, user_id, course_id, score, started_at, submitted_at
       FROM quiz_attempts
       WHERE user_id = ? AND course_id = ? AND submitted_at IS NULL AND started_at IS NOT NULL
       ORDER BY id DESC
       LIMIT 1`,
      [userId, courseId]
    );
    if (openRows.length > 0) {
      await connection.commit();
      return { attempt: openRows[0], attemptNumber: attemptCount, resumed: true };
    }

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

    if (questions.length > 0) {
      await connection.query(
        `INSERT INTO quiz_attempt_answers
         (attempt_id, question_id, position, question_content, options, selected_answer, correct_answer, is_correct)
         VALUES ?`,
        [questions.map((q, index) => [
          result.insertId, q.id, index + 1, q.content, JSON.stringify(q.options), null, null, false
        ])]
      );
    }

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
      attemptNumber: attemptCount + 1,
      resumed: false
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
    'SELECT id, user_id, course_id, score, status, started_at, submitted_at FROM quiz_attempts WHERE id = ? LIMIT 1',
    [attemptId]
  );
  return rows[0] || null;
};

// Nộp bài trong một transaction: chốt điểm (chỉ khi chưa nộp) rồi ghi chi tiết từng câu.
// details: [{ questionId, content, selectedAnswer, correctAnswer, isCorrect, options }]
// options lấy theo thứ tự đã lưu lúc bắt đầu; câu nào chưa có thì dùng options truyền vào.
const updateAttemptResultIfNotSubmitted = async (attemptId, userId, { score, submitted_at }, details = []) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE quiz_attempts
       SET score = ?, status = 'submitted', submitted_at = ?
       WHERE id = ? AND user_id = ? AND submitted_at IS NULL`,
      [score, submitted_at, attemptId, userId]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    if (details.length > 0) {
      const [snapshots] = await connection.query(
        'SELECT question_id AS questionId, options FROM quiz_attempt_answers WHERE attempt_id = ?',
        [attemptId]
      );
      const savedOptions = new Map(snapshots.map((row) => [Number(row.questionId), row.options]));

      await connection.query('DELETE FROM quiz_attempt_answers WHERE attempt_id = ?', [attemptId]);
      await connection.query(
        `INSERT INTO quiz_attempt_answers
         (attempt_id, question_id, position, question_content, options, selected_answer, correct_answer, is_correct)
         VALUES ?`,
        [details.map((item, index) => [
          attemptId,
          item.questionId,
          index + 1,
          item.content,
          savedOptions.get(Number(item.questionId)) ?? JSON.stringify(item.options ?? []),
          typeof item.selectedAnswer === 'string' ? item.selectedAnswer.slice(0, 255) : null,
          item.correctAnswer,
          item.isCorrect
        ])]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Số lượt đã bắt đầu (kể cả lượt bỏ dở) – cùng cách đếm với giới hạn lượt khi bắt đầu làm bài
const countStartedAttempts = async (userId, courseId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM quiz_attempts WHERE user_id = ? AND course_id = ? AND started_at IS NOT NULL',
    [userId, courseId]
  );
  return Number(rows[0].total);
};

const getBestScore = async (userId, courseId) => {
  const [rows] = await pool.query(
    'SELECT MAX(score) AS best_score FROM quiz_attempts WHERE user_id = ? AND course_id = ? AND submitted_at IS NOT NULL',
    [userId, courseId]
  );
  return rows[0].best_score !== null ? Number(rows[0].best_score) : 0;
};

// HT-07: một lượt làm bài đã nộp kèm số thứ tự lượt trong khóa học
const findAttemptForReview = async (attemptId) => {
  const [rows] = await pool.query(
    `SELECT qa.id, qa.user_id, qa.course_id, qa.score, qa.started_at, qa.submitted_at,
            c.title AS course_title,
            (SELECT COUNT(*) FROM quiz_attempts AS prev
             WHERE prev.user_id = qa.user_id AND prev.course_id = qa.course_id
               AND prev.submitted_at IS NOT NULL AND prev.score IS NOT NULL
               AND (prev.started_at < qa.started_at
                    OR (prev.started_at = qa.started_at AND prev.id <= qa.id))) AS attempt_number
     FROM quiz_attempts AS qa
     JOIN courses AS c ON c.id = qa.course_id
     WHERE qa.id = ?
     LIMIT 1`,
    [attemptId]
  );
  return rows[0] || null;
};

const getAttemptAnswers = async (attemptId) => {
  const [rows] = await pool.query(
    `SELECT question_id, position, question_content, options,
            selected_answer, correct_answer, is_correct
     FROM quiz_attempt_answers
     WHERE attempt_id = ?
     ORDER BY position ASC, id ASC`,
    [attemptId]
  );
  return rows;
};

module.exports = {
  findCourseById,
  getQuestionsByCourseId,
  createAttemptWithLock,
  closeExpiredAttempts,
  findAttemptById,
  updateAttemptResultIfNotSubmitted,
  getBestScore,
  countStartedAttempts,
  findAttemptForReview,
  getAttemptAnswers
};