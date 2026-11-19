const { pool } = require('../config/db');

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
    courseId: Number(question.courseId)
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
  return rows[0] || null;
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

module.exports = { findByCourseId, findById, create, update, remove };
