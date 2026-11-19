// AI-assisted [AI-13]
const { pool } = require('../config/db');

// Lấy danh sách khóa học của giảng viên kèm số lượng câu hỏi hiện có
const findCoursesByTeacherId = async (teacherId) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.title,
       c.user_id,
       c.quiz_duration,
       c.status,
       COUNT(q.id) AS questionCount
     FROM courses AS c
     LEFT JOIN questions AS q ON q.course_id = c.id
     WHERE c.user_id = ?
     GROUP BY c.id, c.title, c.user_id, c.quiz_duration, c.status
     ORDER BY c.id DESC`,
    [teacherId]
  );
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
    user_id: Number(row.user_id),
    quiz_duration: row.quiz_duration !== null ? Number(row.quiz_duration) : null,
    questionCount: Number(row.questionCount),
  }));
};

// Tìm thông tin khóa học theo ID để kiểm tra quyền sở hữu
const findCourseById = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT id, title, user_id, quiz_duration FROM courses WHERE id = ? LIMIT 1',
    [courseId]
  );
  return rows[0] || null;
};

// Cập nhật thời gian làm bài (phút) của khóa học
const updateCourseQuizDuration = async (courseId, quizDuration) => {
  const [result] = await pool.query(
    'UPDATE courses SET quiz_duration = ? WHERE id = ?',
    [quizDuration, courseId]
  );
  return result.affectedRows > 0;
};

// Lấy toàn bộ câu hỏi của một khóa học
const findQuestionsByCourseId = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT id, course_id, content, correct_answer, false_answer FROM questions WHERE course_id = ? ORDER BY id ASC',
    [courseId]
  );
  return rows;
};

// Tìm chi tiết 1 câu hỏi theo ID
const findQuestionById = async (questionId) => {
  const [rows] = await pool.query(
    'SELECT id, course_id, content, correct_answer, false_answer FROM questions WHERE id = ? LIMIT 1',
    [questionId]
  );
  return rows[0] || null;
};

// Thêm câu hỏi mới
const createQuestion = async ({ courseId, content, correctAnswer, falseAnswersJson }) => {
  const [result] = await pool.query(
    'INSERT INTO questions (course_id, content, correct_answer, false_answer) VALUES (?, ?, ?, ?)',
    [courseId, content, correctAnswer, falseAnswersJson]
  );
  return result.insertId;
};

// Cập nhật câu hỏi
const updateQuestion = async (questionId, { content, correctAnswer, falseAnswersJson }) => {
  const [result] = await pool.query(
    'UPDATE questions SET content = ?, correct_answer = ?, false_answer = ? WHERE id = ?',
    [content, correctAnswer, falseAnswersJson, questionId]
  );
  return result.affectedRows > 0;
};

// Xóa câu hỏi
const deleteQuestion = async (questionId) => {
  const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);
  return result.affectedRows > 0;
};

module.exports = {
  findCoursesByTeacherId,
  findCourseById,
  updateCourseQuizDuration,
  findQuestionsByCourseId,
  findQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};