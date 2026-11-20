// Seed dữ liệu mẫu cho hệ thống quản lý học tập (với băm mật khẩu bcrypt)
/**
 * Yêu cầu:
 * - 5 danh mục
 * - 19 người dùng (1 admin, 3 giảng viên, 15 học viên)
 * - 8 khóa học, mỗi khóa 5 bài học và 10 câu hỏi trắc nghiệm
 * - Ghi danh, một số lượt làm bài, tiến độ bài học, bình luận và thảo luận mẫu
 * - Mật khẩu demo: 12345678 (được băm bằng bcrypt nếu có)
 *
 * Chạy: cd Database && npx knex seed:run
 */
exports.seed = async function(knex) {
  // bcrypt hash for the demo password "password123".
  const demoPasswordHash = '$2b$10$hOdnrC.YD1n6pDUbTYLP7.P01EuOp5tqVbGw3xST1EB3gnoPtPeOm';

  // 1. Tắt ràng buộc khóa ngoại để làm sạch dữ liệu cũ
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('lesson_progress').truncate();
  await knex('quiz_attempts').truncate();
  await knex('questions').truncate();
  await knex('lessons').truncate();
  await knex('enrollments').truncate();
  await knex('courses').truncate();
  await knex('users').truncate();
  await knex('categories').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // 2. Chèn ĐÚNG 5 Danh mục (categories)
  const categories = [
    { id: 1, name: 'Lập trình Web' },
    { id: 2, name: 'Lập trình Mobile' },
    { id: 3, name: 'Cơ sở dữ liệu' },
    { id: 4, name: 'Khoa học dữ liệu' },
    { id: 5, name: 'Thiết kế UI/UX' },
  ];
  await knex('categories').insert(categories);

  // 3. Chèn ĐÚNG 19 Người dùng (1 Admin + 3 Giảng viên + 15 Học viên)
  const users = [
    // 1 Admin (id = 1)
    { id: 1, name: 'Quản trị viên', email: 'admin@gmail.com', password: demoPasswordHash, role: 'admin' },

    // 3 Giảng viên (id = 2, 3, 4)
    { id: 2, name: 'Nguyễn Văn A (Giảng viên)', email: 'teacher1@gmail.com', password: demoPasswordHash, role: 'teacher' },
    { id: 3, name: 'Trần Thị B (Giảng viên)', email: 'teacher2@gmail.com', password: demoPasswordHash, role: 'teacher' },
    { id: 4, name: 'Lê Hoàng C (Giảng viên)', email: 'teacher3@gmail.com', password: demoPasswordHash, role: 'teacher' },
  ];

  // 15 Học viên (id = 5 đến 19)
  for (let i = 1; i <= 15; i++) {
    users.push({
      id: i + 4,
      name: `Học viên ${i}`,
      email: `student${i}@gmail.com`,
      password: demoPasswordHash,
      role: 'student'
    });
  }
  await knex('users').insert(users);

  // 4. Chèn ĐÚNG 8 Khóa học (courses)
  const courses = [
    { id: 1, title: 'Node.js & ExpressJS Cơ bản', description: 'Khóa học Node.js cho người mới bắt đầu', category_id: 1, user_id: 2, price_course: 499000, quiz_minutes: 30 },
    { id: 2, title: 'ReactJS Nâng cao', description: 'Xây dựng ứng dụng Web thực tế với ReactJS', category_id: 1, user_id: 2, price_course: 699000, quiz_minutes: 45 },
    { id: 3, title: 'Lập trình Flutter Cross-platform', description: 'Tạo ứng dụng iOS & Android với Flutter', category_id: 2, user_id: 3, price_course: 599000, quiz_minutes: 30 },
    { id: 4, title: 'Lập trình Android với Kotlin', description: 'Phát triển ứng dụng Android thuần', category_id: 2, user_id: 3, price_course: 550000, quiz_minutes: 40 },
    { id: 5, title: 'Cơ sở dữ liệu MySQL từ A-Z', description: 'Thiết kế DB và tối ưu truy vấn MySQL', category_id: 3, user_id: 4, price_course: 399000, quiz_minutes: 25 },
    { id: 6, title: 'Phân tích Dữ liệu với Python', description: 'Sử dụng Pandas, Numpy cho Data Science', category_id: 4, user_id: 4, price_course: 799000, quiz_minutes: 60 },
    { id: 7, title: 'Figma Thiết kế UI/UX Chuyên nghiệp', description: 'Thiết kế giao diện người dùng đỉnh cao', category_id: 5, user_id: 2, price_course: 450000, quiz_minutes: 20 },
    { id: 8, title: 'Machine Learning Cơ bản', description: 'Học máy và ứng dụng thực tế', category_id: 4, user_id: 3, price_course: 899000, quiz_minutes: 45 },
  ];
  STUDENT_NAMES.forEach((name, idx) => {
    base.push({
      id: idx + 5,
      name,
      email: `student${idx + 1}@gmail.com`,
      password: hashedPassword,
      role: 'student',
      status: 'active'
    });
  });
  return base;
};

const buildCourses = () =>
  COURSES.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category_id: c.category_id,
    user_id: c.user_id,
    price_course: 0,
    quiz_minutes: c.quiz_minutes,
    status: 'public'
  }));

const buildLessons = () => {
  const lessons = [];
  COURSES.forEach((course) => {
    course.lessons.forEach((title, i) => {
      lessons.push({
        id: (course.id - 1) * 5 + i + 1,
        course_id: course.id,
        title,
        content: `Nội dung bài học "${title}" của khóa "${course.title}".`,
        video_path: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
        position: i + 1
      });
      lessonIdCounter++;
    }
  }
  await knex('lessons').insert(lessons);

  // 6. Chèn ĐÚNG 80 Câu hỏi (8 khóa × 10 câu/khóa)
  const questions = [];
  let questionIdCounter = 1;
  for (let courseId = 1; courseId <= 8; courseId++) {
    for (let qIndex = 1; qIndex <= 10; qIndex++) {
      questions.push({
        id: questionIdCounter,
        course_id: courseId,
        content: `Câu hỏi số ${qIndex} của khóa học ${courseId}?`,
        correct_answer: `Đáp án đúng câu ${qIndex}`,
        false_answer: `Đáp án sai 1 câu ${qIndex}`,
        false_answer_2: `Đáp án sai 2 câu ${qIndex}`,
        false_answer_3: `Đáp án sai 3 câu ${qIndex}`,
      });
    });
  });
  return qs;
};

/**
 * @param { import('knex').Knex } knex
 */
exports.seed = async function (knex) {
  // Store password as SHA2 hash directly in MySQL (256‑bit)
  const hashed = knex.raw('SHA2(?, 256)', [PASSWORD]);
  console.info('[seed] passwords will be stored as SHA2(256) hash in MySQL');

  await knex.transaction(async (trx) => {
    const tables = [
      'lesson_progress',
      'quiz_attempts',
      'discussions',
      'comments',
      'questions',
      'lessons',
      'enrollments',
      'courses',
      'users',
      'categories'
    ];
    for (const t of tables) await trx(t).del();
  });

  await knex('categories').insert(CATEGORIES);
  await knex('users').insert(buildUsers(hashed));
  await knex('courses').insert(buildCourses());
  await knex('lessons').insert(buildLessons());
  await knex('questions').insert(buildQuestions());
  await knex('enrollments').insert(ENROLLMENTS);

  await knex('quiz_attempts').insert(
    QUIZ_ATTEMPTS.map((a, i) => ({ id: i + 1, ...a, status: 'submitted' }))
  );
  await knex('lesson_progress').insert(
    LESSON_PROGRESS.map((p, i) => ({ id: i + 1, ...p }))
  );
  await knex('comments').insert(
    COMMENTS.map((c, i) => ({ id: i + 1, ...c }))
  );

  // Đầu tiên chèn các discussion gốc (parent_id = null) để tránh vi phạm FK
  await knex('discussions').insert(DISCUSSIONS.filter((d) => d.parent_id === null));
  await knex('discussions').insert(DISCUSSIONS.filter((d) => d.parent_id !== null));
};
// End of seed file
