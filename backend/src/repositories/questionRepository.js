// AI-assisted [AI-13]
const { pool } = require('../config/db');

// Lấy danh sách khóa học của giảng viên kèm số lượng câu hỏi hiện có
const findCoursesByTeacherId = async (teacherId) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.title,
       c.user_id,
       c.quiz_minutes,
       c.status,
       c.category_id AS categoryId,
       category.name AS categoryName,
       COUNT(q.id) AS questionCount
     FROM courses AS c
     LEFT JOIN questions AS q ON q.course_id = c.id
     LEFT JOIN categories AS category ON category.id = c.category_id
     WHERE c.user_id = ?
     GROUP BY c.id, c.title, c.user_id, c.quiz_minutes, c.status, c.category_id, category.name
     ORDER BY c.id DESC`,
    [teacherId]
  );
  return rows.map((row) => {
    const minutes = row.quiz_minutes !== null ? Number(row.quiz_minutes) : null;
    return {
      ...row,
      id: Number(row.id),
      user_id: Number(row.user_id),
      quiz_minutes: minutes,
      quiz_duration: minutes,
      questionCount: Number(row.questionCount),
    };
  });
};

// Tìm thông tin khóa học theo ID để kiểm tra quyền sở hữu
const findCourseById = async (courseId) => {
  const [rows] = await pool.query(
    'SELECT id, title, user_id, quiz_minutes FROM courses WHERE id = ? LIMIT 1',
    [courseId]
  );
  if (!rows[0]) return null;
  const minutes = rows[0].quiz_minutes !== null ? Number(rows[0].quiz_minutes) : null;
  return {
    ...rows[0],
    quiz_minutes: minutes,
    quiz_duration: minutes,
  };
};

// Cập nhật thời gian làm bài (phút) của khóa học
const updateCourseQuizDuration = async (courseId, quizMinutes) => {
  const [result] = await pool.query(
    'UPDATE courses SET quiz_minutes = ? WHERE id = ?',
    [quizMinutes, courseId]
  );
  return result.affectedRows > 0;
};

const findByCourseId = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT id, course_id AS courseId, content, correct_answer AS correctAnswer,
            false_answer AS falseAnswer, false_answer_2 AS falseAnswer2,
            false_answer_3 AS falseAnswer3
     FROM questions
     WHERE course_id = ?
     ORDER BY id ASC`,
    [courseId]
  );
  return rows.map((question) => ({
    ...question,
    id: Number(question.id),
    courseId: Number(question.courseId),
  }));
};

const findById = async (questionId) => {
  const [rows] = await pool.query(
    `SELECT id, course_id AS courseId, content, correct_answer AS correctAnswer,
            false_answer AS falseAnswer, false_answer_2 AS falseAnswer2,
            false_answer_3 AS falseAnswer3
     FROM questions
     WHERE id = ?
     LIMIT 1`,
    [questionId]
  );
  if (!rows[0]) return null;
  return {
    ...rows[0],
    id: Number(rows[0].id),
    courseId: Number(rows[0].courseId),
  };
};

const create = async ({ courseId, content, correctAnswer, falseAnswer, falseAnswer2, falseAnswer3 }) => {
  const [result] = await pool.query(
    `INSERT INTO questions
       (course_id, content, correct_answer, false_answer, false_answer_2, false_answer_3)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [courseId, content, correctAnswer, falseAnswer, falseAnswer2, falseAnswer3]
  );
  return result.insertId;
};

const update = async (questionId, { content, correctAnswer, falseAnswer, falseAnswer2, falseAnswer3 }) => {
  const [result] = await pool.query(
    `UPDATE questions
     SET content = ?, correct_answer = ?, false_answer = ?, false_answer_2 = ?, false_answer_3 = ?
     WHERE id = ?`,
    [content, correctAnswer, falseAnswer, falseAnswer2, falseAnswer3, questionId]
  );
  return result.affectedRows > 0;
};

const remove = async (questionId) => {
  const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);
  return result.affectedRows > 0;
};

module.exports = {
  findCoursesByTeacherId,
  findCourseById,
  updateCourseQuizDuration,
  findByCourseId,
  findById,
  create,
  update,
  remove,
};