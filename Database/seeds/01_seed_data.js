/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
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
    { id: 1, name: 'Quản trị viên', email: 'admin@gmail.com', password: 'password123', role: 'admin' },

    // 3 Giảng viên (id = 2, 3, 4)
    { id: 2, name: 'Nguyễn Văn A (Giảng viên)', email: 'teacher1@gmail.com', password: 'password123', role: 'teacher' },
    { id: 3, name: 'Trần Thị B (Giảng viên)', email: 'teacher2@gmail.com', password: 'password123', role: 'teacher' },
    { id: 4, name: 'Lê Hoàng C (Giảng viên)', email: 'teacher3@gmail.com', password: 'password123', role: 'teacher' },
  ];

  // 15 Học viên (id = 5 đến 19)
  for (let i = 1; i <= 15; i++) {
    users.push({
      id: i + 4,
      name: `Học viên ${i}`,
      email: `student${i}@gmail.com`,
      password: 'password123',
      role: 'student'
    });
  }
  await knex('users').insert(users);

  // 4. Chèn ĐÚNG 8 Khóa học (courses)
  const courses = [
    { id: 1, title: 'Node.js & ExpressJS Cơ bản', description: 'Khóa học Node.js cho người mới bắt đầu', category_id: 1, user_id: 2, price_course: 499000, quiz_duration: 30 },
    { id: 2, title: 'ReactJS Nâng cao', description: 'Xây dựng ứng dụng Web thực tế với ReactJS', category_id: 1, user_id: 2, price_course: 699000, quiz_duration: 45 },
    { id: 3, title: 'Lập trình Flutter Cross-platform', description: 'Tạo ứng dụng iOS & Android với Flutter', category_id: 2, user_id: 3, price_course: 599000, quiz_duration: 30 },
    { id: 4, title: 'Lập trình Android với Kotlin', description: 'Phát triển ứng dụng Android thuần', category_id: 2, user_id: 3, price_course: 550000, quiz_duration: 40 },
    { id: 5, title: 'Cơ sở dữ liệu MySQL từ A-Z', description: 'Thiết kế DB và tối ưu truy vấn MySQL', category_id: 3, user_id: 4, price_course: 399000, quiz_duration: 25 },
    { id: 6, title: 'Phân tích Dữ liệu với Python', description: 'Sử dụng Pandas, Numpy cho Data Science', category_id: 4, user_id: 4, price_course: 799000, quiz_duration: 60 },
    { id: 7, title: 'Figma Thiết kế UI/UX Chuyên nghiệp', description: 'Thiết kế giao diện người dùng đỉnh cao', category_id: 5, user_id: 2, price_course: 450000, quiz_duration: 20 },
    { id: 8, title: 'Machine Learning Cơ bản', description: 'Học máy và ứng dụng thực tế', category_id: 4, user_id: 3, price_course: 899000, quiz_duration: 45 },
  ];
  await knex('courses').insert(courses);

  // 5. Chèn ĐÚNG 40 Bài học (8 khóa × 5 bài/khóa)
  const lessons = [];
  let lessonIdCounter = 1;
  for (let courseId = 1; courseId <= 8; courseId++) {
    for (let lessonIndex = 1; lessonIndex <= 5; lessonIndex++) {
      lessons.push({
        id: lessonIdCounter,
        course_id: courseId,
        title: `Bài ${lessonIndex}: Kiến thức thuộc khóa học ${courseId}`,
        content: `Nội dung chi tiết bài học số ${lessonIndex} của khóa ${courseId}.`,
        video_path: `https://storage.example.com/videos/course_${courseId}_lesson_${lessonIndex}.mp4`,
        file_path: `https://storage.example.com/docs/course_${courseId}_lesson_${lessonIndex}.pdf`
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
        false_answer: `Đáp án sai câu ${qIndex}`
      });
      questionIdCounter++;
    }
  }
  await knex('questions').insert(questions);

  // 7. Chèn dữ liệu mẫu Ghi danh (enrollments)
  const enrollments = [
    { id: 1, user_id: 5, course_id: 1 },
    { id: 2, user_id: 5, course_id: 2 },
    { id: 3, user_id: 6, course_id: 1 },
    { id: 4, user_id: 7, course_id: 3 },
    { id: 5, user_id: 8, course_id: 5 },
    { id: 6, user_id: 9, course_id: 6 },
    { id: 7, user_id: 10, course_id: 8 },
  ];
  await knex('enrollments').insert(enrollments);

  // 8. Chèn dữ liệu mẫu Lượt làm bài (quiz_attempts)
  const quizAttempts = [
    { id: 1, user_id: 5, course_id: 1, score: 9.5 },
    { id: 2, user_id: 5, course_id: 2, score: 8.0 },
    { id: 3, user_id: 6, course_id: 1, score: 7.0 },
    { id: 4, user_id: 7, course_id: 3, score: 10.0 },
    { id: 5, user_id: 8, course_id: 5, score: 6.5 },
  ];
  await knex('quiz_attempts').insert(quizAttempts);

  // 9. Chèn dữ liệu mẫu Tiến độ bài học (lesson_progress)
  const lessonProgress = [
    { id: 1, user_id: 5, lesson_id: 1, is_completed: true },
    { id: 2, user_id: 5, lesson_id: 2, is_completed: true },
    { id: 3, user_id: 6, lesson_id: 1, is_completed: true },
    { id: 4, user_id: 7, lesson_id: 11, is_completed: true },
  ];
  await knex('lesson_progress').insert(lessonProgress);
};
//AI-assisted: <Gemini> [AI-09]