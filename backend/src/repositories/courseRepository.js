// AI-assisted [AI-05]
const { pool } = require('../config/db');

class CourseRepository {
  async findPage({ page, limit, search, categoryId, teacherId }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const filterParams = [];

    if (search) {
      conditions.push('c.title LIKE ?');
      filterParams.push(`%${search}%`);
    }
    if (categoryId !== undefined) {
      conditions.push('c.category_id = ?');
      filterParams.push(categoryId);
    }
    if (teacherId !== undefined) {
      conditions.push('c.user_id = ?');
      filterParams.push(teacherId);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const [courses] = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.user_id AS teacherId,
         u.name AS teacherName,
         c.category_id AS categoryId,
         category.name AS categoryName,
         COUNT(lesson.id) AS lessonCount,
         COALESCE(c.thumbnail, '/images/course-default.jpg') AS coverImage
       FROM courses AS c
       LEFT JOIN users AS u ON u.id = c.user_id
       LEFT JOIN categories AS category ON category.id = c.category_id
       LEFT JOIN lessons AS lesson ON lesson.course_id = c.id
       ${whereClause}
       GROUP BY
         c.id,
         c.title,
         c.user_id,
         u.name,
         c.category_id,
         category.name,
         c.thumbnail
       ORDER BY c.id ASC
       LIMIT ? OFFSET ?`,
      [...filterParams, limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM courses AS c ${whereClause}`,
      filterParams
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
  }

  async create(courseData) {
    const {
      title,
      description,
      category_id,
      user_id,
      price_course,
      quiz_minutes,
      thumbnail,
      status
    } = courseData;
    const [result] = await pool.query(
      `INSERT INTO courses
       (title, description, category_id, user_id, price_course, quiz_minutes, thumbnail, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category_id,
        user_id,
        price_course,
        quiz_minutes ?? null,
        thumbnail ?? null,
        status ?? 'draft'
      ]
    );
    return result.insertId;
  }

  async findByTeacherId(userId) {
    const [rows] = await pool.query(
      `SELECT id, thumbnail, title, description, category_id, user_id,
              price_course, quiz_minutes, status
       FROM courses
       WHERE user_id = ?
       ORDER BY id DESC`,
      [userId]
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, thumbnail, title, description, category_id, user_id,
              price_course, quiz_minutes, status
       FROM courses
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  async findDetailById(id, userId = null) {
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.description,
         COALESCE(c.thumbnail, '/images/course-default.jpg') AS coverImage,
         c.user_id AS teacherId,
         u.name AS teacherName,
         c.category_id AS categoryId,
         category.name AS categoryName,
         (SELECT COUNT(*) FROM lessons AS l WHERE l.course_id = c.id) AS lessonCount,
         (SELECT COUNT(*) FROM enrollments AS e WHERE e.course_id = c.id) AS studentCount,
         EXISTS(
           SELECT 1
           FROM enrollments AS current_enrollment
           WHERE current_enrollment.course_id = c.id
             AND current_enrollment.user_id = ?
         ) AS isEnrolled
       FROM courses AS c
       LEFT JOIN users AS u ON u.id = c.user_id
       LEFT JOIN categories AS category ON category.id = c.category_id
       WHERE c.id = ?
       LIMIT 1`,
      [userId, id]
    );

    if (!rows[0]) return null;

    const course = rows[0];
    return {
      ...course,
      id: Number(course.id),
      teacherId: Number(course.teacherId),
      categoryId: Number(course.categoryId),
      lessonCount: Number(course.lessonCount),
      studentCount: Number(course.studentCount),
      isEnrolled: Boolean(course.isEnrolled)
    };
  }

  async findLessonSummariesByCourseId(courseId) {
    const [rows] = await pool.query(
      `SELECT id, position AS \`order\`, title
       FROM lessons
       WHERE course_id = ?
       ORDER BY position ASC, id ASC`,
      [courseId]
    );
    return rows.map((lesson) => ({
      ...lesson,
      id: Number(lesson.id),
      order: Number(lesson.order)
    }));
  }

  // ==========================================
  // 4. UPDATE - Cập nhật thông tin khóa học
  // ==========================================
  async update(id, courseData) {
    const {
      title,
      description,
      category_id,
      price_course,
      quiz_minutes,
      thumbnail,
      status
    } = courseData;
    const [result] = await pool.query(
      `UPDATE courses
       SET title = ?, description = ?, category_id = ?, price_course = ?, quiz_minutes = ?, thumbnail = ?, status = ?
       WHERE id = ?`,
      [title, description, category_id, price_course, quiz_minutes, thumbnail, status, id]
    );
    return result.affectedRows;
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học theo id
  // ==========================================
  async remove(id) {
    const [result] = await pool.query(
      `DELETE FROM courses WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new CourseRepository();
//AI-assisted: <Gemini> [AI-01]
