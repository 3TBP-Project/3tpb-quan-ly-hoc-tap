// AI-assisted [AI-05]
const { pool } = require('../config/db');

class CourseRepository {
  async countPublicLessons(courseId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM lessons
       WHERE course_id = ? AND status = 'public'`,
      [courseId]
    );
    return Number(rows[0].total);
  }

  // Số học viên đã ghi danh khóa học (dùng để chặn xóa / chuyển về bản nháp)
  async countEnrollments(courseId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM enrollments WHERE course_id = ?`,
      [courseId]
    );
    return Number(rows[0].total);
  }

  async setDraftIfNoPublicLessons(courseId) {
    const [result] = await pool.query(
      `UPDATE courses
       SET status = 'draft'
       WHERE id = ? AND status = 'public'
         AND NOT EXISTS (
           SELECT 1 FROM lessons
           WHERE course_id = ? AND status = 'public'
         )`,
      [courseId, courseId]
    );
    return result.affectedRows > 0;
  }

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
    // Danh sách công khai chỉ hiện khóa học "public":
    // bản nháp (draft) và khóa học bị quản trị viên ẩn (hidden, HT-15) đều không hiện
    conditions.push("c.status = 'public'");
    conditions.push(`EXISTS (
      SELECT 1 FROM lessons AS public_lesson
      WHERE public_lesson.course_id = c.id
        AND public_lesson.status = 'public'
    )`);

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const [courses] = await pool.query(
      `SELECT
         c.id,
         c.title,
         c.user_id AS teacherId,
         u.name AS teacherName,
         u.avatar AS teacherAvatar,
         c.category_id AS categoryId,
         category.name AS categoryName,
         COUNT(lesson.id) AS lessonCount,
         COALESCE(c.thumbnail, '/images/course-default.jpg') AS coverImage
       FROM courses AS c
       LEFT JOIN users AS u ON u.id = c.user_id
       LEFT JOIN categories AS category ON category.id = c.category_id
       LEFT JOIN lessons AS lesson ON lesson.course_id = c.id AND lesson.status = 'public'
       ${whereClause}
       GROUP BY
         c.id,
         c.title,
         c.user_id,
         u.name,
         u.avatar,
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
      `SELECT
         c.id,
         c.thumbnail,
         c.title,
         c.description,
         c.category_id AS categoryId,
         category.name AS categoryName,
         c.user_id AS userId,
         c.price_course,
         c.quiz_minutes,
         c.status,
         (SELECT COUNT(*) FROM enrollments AS e WHERE e.course_id = c.id) AS studentCount
       FROM courses AS c
       LEFT JOIN categories AS category ON category.id = c.category_id
       WHERE c.user_id = ?
       ORDER BY c.id DESC`,
      [userId]
    );
    return rows.map((course) => ({ ...course, studentCount: Number(course.studentCount) }));
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
         u.avatar AS teacherAvatar,
         c.category_id AS categoryId,
         category.name AS categoryName,
         c.status,
         (SELECT COUNT(*) FROM lessons AS l
          WHERE l.course_id = c.id AND l.status = 'public') AS lessonCount,
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
    // Cùng thứ tự học với trang học: theo chương rồi tới bài; bài chưa có chương xếp cuối
    const [rows] = await pool.query(
      `SELECT l.id, l.chapter_id AS chapterId, l.position AS \`order\`, l.title
       FROM lessons AS l
       LEFT JOIN chapters AS ch ON ch.id = l.chapter_id
       WHERE l.course_id = ? AND l.status = 'public'
       ORDER BY COALESCE(ch.position, 2147483647), COALESCE(ch.id, 2147483647), l.position, l.id`,
      [courseId]
    );
    return rows.map((lesson) => ({
      ...lesson,
      id: Number(lesson.id),
      chapterId: lesson.chapterId == null ? null : Number(lesson.chapterId),
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

  // 4b. Chỉ đổi ảnh bìa (null = xóa ảnh bìa)
  async updateThumbnail(id, thumbnail) {
    const [result] = await pool.query(
      `UPDATE courses SET thumbnail = ? WHERE id = ?`,
      [thumbnail ?? null, id]
    );
    return result.affectedRows;
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học theo id
  // ==========================================
  async remove(id) {
    // Điều kiện NOT EXISTS chặn trường hợp học viên vừa ghi danh ngay trước khi xóa
    const [result] = await pool.query(
      `DELETE FROM courses
       WHERE id = ?
         AND NOT EXISTS (SELECT 1 FROM enrollments WHERE course_id = ?)`,
      [id, id]
    );
    return result.affectedRows;
  }
}

module.exports = new CourseRepository();
//AI-assisted: <Gemini> [AI-01]
