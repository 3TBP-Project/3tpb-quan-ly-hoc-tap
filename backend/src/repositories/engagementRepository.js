const { pool } = require('../config/db');

const listCourseComments = async (courseId) => {
  const [rows] = await pool.query(
    `SELECT cmt.id, cmt.user_id AS userId, u.name AS userName,
            cmt.rating, cmt.content, cmt.created_at AS createdAt
     FROM comments AS cmt
     JOIN users AS u ON u.id = cmt.user_id
     WHERE cmt.course_id = ? AND cmt.lesson_id IS NULL
       AND cmt.rating IS NOT NULL
     ORDER BY cmt.created_at DESC, cmt.id DESC`,
    [courseId]
  );
  return rows.map((comment) => ({
    ...comment,
    id: Number(comment.id),
    userId: Number(comment.userId),
    rating: Number(comment.rating)
  }));
};

const createCourseComment = async ({ userId, courseId, rating, content }) => {
  const [result] = await pool.query(
    `INSERT INTO comments (user_id, course_id, rating, content)
     VALUES (?, ?, ?, ?)`,
    [userId, courseId, rating, content]
  );
  return result.insertId;
};

const listDiscussions = async (lessonId) => {
  const [rows] = await pool.query(
    `SELECT d.id, d.lesson_id AS lessonId,
            d.user_id AS userId, u.name AS userName,
            d.parent_id AS parentId, d.content,
            d.created_at AS createdAt
     FROM discussions AS d
     JOIN users AS u ON u.id = d.user_id
     WHERE d.lesson_id = ?
     ORDER BY d.created_at ASC, d.id ASC`,
    [lessonId]
  );
  return rows.map((discussion) => ({
    ...discussion,
    id: Number(discussion.id),
    lessonId: Number(discussion.lessonId),
    userId: Number(discussion.userId),
    parentId: discussion.parentId === null ? null : Number(discussion.parentId)
  }));
};

const findDiscussionById = async (discussionId) => {
  const [rows] = await pool.query(
    'SELECT id, lesson_id FROM discussions WHERE id = ? LIMIT 1',
    [discussionId]
  );
  return rows[0] || null;
};

const createDiscussion = async ({ lessonId, userId, parentId, content }) => {
  const [result] = await pool.query(
    `INSERT INTO discussions (lesson_id, user_id, parent_id, content)
     VALUES (?, ?, ?, ?)`,
    [lessonId, userId, parentId, content]
  );
  return result.insertId;
};

module.exports = {
  listCourseComments,
  createCourseComment,
  listDiscussions,
  findDiscussionById,
  createDiscussion
};
