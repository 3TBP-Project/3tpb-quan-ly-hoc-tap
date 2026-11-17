// AI-assisted [AI-05]
const { pool } = require('../config/db');

const findPage = async ({ page, limit }) => {
  const offset = (page - 1) * limit;
  const [courses] = await pool.query(
    `SELECT
       c.id,
       c.title,
       c.user_id AS teacherId,
       u.name AS teacherName,
       c.category_id AS categoryId,
       category.name AS categoryName,
       COUNT(lesson.id) AS lessonCount,
       '/images/course-default.jpg' AS coverImage
     FROM courses AS c
     LEFT JOIN users AS u ON u.id = c.user_id
     LEFT JOIN categories AS category ON category.id = c.category_id
     LEFT JOIN lessons AS lesson ON lesson.course_id = c.id
     GROUP BY
       c.id,
       c.title,
       c.user_id,
       u.name,
       c.category_id,
       category.name
     ORDER BY c.id ASC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM courses'
  );

  return {
    courses: courses.map((course) => ({
      ...course,
      id: Number(course.id),
      teacherId: Number(course.teacherId),
      categoryId: Number(course.categoryId),
      lessonCount: Number(course.lessonCount)
    })),
    total: Number(countRows[0].total)
  };
};

module.exports = { findPage };
