// Seed dữ liệu demo tối giản, độc lập và chạy lại được nhiều lần (idempotent):
// - Tài khoản demo 3 vai trò (admin, teacher, student) - mật khẩu: 12345678
// - 2 khóa học công khai đầy đủ chương học, bài học (video YouTube) và 10 câu hỏi trắc nghiệm/khóa
//
// Chạy riêng file này:  cd Database && npx knex seed:run --specific=02_seed_demo.js
// Chạy toàn bộ seed:    cd Database && npx knex seed:run

const DEMO_PASSWORD = '12345678';
const SALT_ROUNDS = 10;

const DEMO_USERS = [
  { name: 'Admin Demo', email: 'admin.demo@gmail.com', role: 'admin' },
  { name: 'Giảng viên Demo', email: 'teacher.demo@gmail.com', role: 'teacher' },
  { name: 'Học viên Demo', email: 'student.demo@gmail.com', role: 'student' }
];

const DEMO_CATEGORIES = [
  'Lập trình Web',
  'Cơ sở dữ liệu'
];

const DEMO_COURSES = [
  {
    title: '[Demo] Lập trình Web Fullstack với Node.js & React',
    description: 'Khóa học demo đầy đủ chương, bài học công khai và ngân hàng câu hỏi trắc nghiệm để kiểm thử toàn bộ luồng học và thi.',
    categoryName: 'Lập trình Web',
    quiz_minutes: 15,
    chapters: [
      'Chương 1: Nền tảng Backend với ExpressJS',
      'Chương 2: Xây dựng giao diện với React'
    ],
    lessons: [
      {
        chapterIndex: 0,
        title: 'Bài 1: Khởi tạo Express Server và REST API',
        content: 'Hướng dẫn cài đặt Express.js, cấu trúc thư mục theo mô hình Routes - Controllers - Services - Repositories.',
        video_path: 'https://www.youtube.com/watch?v=P-fDVxjSXEw'
      },
      {
        chapterIndex: 0,
        title: 'Bài 2: Kết nối MySQL và xác thực JWT',
        content: 'Sử dụng mysql2 kết hợp jsonwebtoken để bảo vệ API và phân quyền theo vai trò.',
        video_path: 'https://www.youtube.com/watch?v=LsYhxjOlZsY'
      },
      {
        chapterIndex: 1,
        title: 'Bài 3: Component, Props và State trong React',
        content: 'Làm quen với JSX, quản lý trạng thái bằng useState và truyền dữ liệu giữa các component.',
        video_path: 'https://www.youtube.com/watch?v=HKX__TQ9ff0'
      },
      {
        chapterIndex: 1,
        title: 'Bài 4: Gọi API bằng Axios và bảo vệ Route',
        content: 'Kết nối React với REST API bằng Axios, lưu token và bảo vệ đường dẫn với React Router.',
        video_path: 'https://www.youtube.com/watch?v=oUZjO00NkhY'
      }
    ],
    questions: [
      { q: 'ExpressJS chạy trên nền tảng nào?', correct: 'Node.js', wrong: ['Python', 'PHP', 'Ruby'] },
      { q: 'Thư viện nào dùng để kết nối MySQL trong dự án?', correct: 'mysql2', wrong: ['mongoose', 'pg', 'sqlite3'] },
      { q: 'JWT viết tắt của cụm từ nào?', correct: 'JSON Web Token', wrong: ['Java Web Tool', 'JavaScript Window Token', 'JSON Wire Transfer'] },
      { q: 'Mã HTTP nào biểu thị tạo mới tài nguyên thành công?', correct: '201 Created', wrong: ['200 OK', '400 Bad Request', '404 Not Found'] },
      { q: 'Hook nào quản lý state cơ bản trong React?', correct: 'useState', wrong: ['useEffect', 'useRef', 'useMemo'] },
      { q: 'Thư viện nào dùng để điều hướng trang trong React SPA?', correct: 'react-router-dom', wrong: ['express-router', 'axios', 'bootstrap'] },
      { q: 'Thuật toán nào được dùng để băm mật khẩu trong dự án?', correct: 'bcrypt', wrong: ['md5', 'base64', 'sha1'] },
      { q: 'Middleware trong Express nhận tối đa mấy tham số chuẩn?', correct: '3 tham số (req, res, next)', wrong: ['1 tham số (req)', '2 tham số (req, res)', '5 tham số'] },
      { q: 'Lệnh nào dùng để khởi chạy Vite dev server?', correct: 'npm run dev', wrong: ['npm run build', 'npx knex migrate', 'node server.js'] },
      { q: 'Header HTTP nào thường dùng để gửi Bearer JWT?', correct: 'Authorization', wrong: ['Content-Type', 'Accept', 'User-Agent'] }
    ]
  },
  {
    title: '[Demo] Thiết kế & Quản trị Cơ sở dữ liệu MySQL',
    description: 'Khóa học demo thứ 2 về chuẩn hóa dữ liệu 3NF, khóa ngoại, index và truy vấn SQL tối ưu.',
    categoryName: 'Cơ sở dữ liệu',
    quiz_minutes: 20,
    chapters: [
      'Chương 1: Mô hình quan hệ và chuẩn hóa 3NF',
      'Chương 2: Truy vấn nâng cao và tối ưu Index'
    ],
    lessons: [
      {
        chapterIndex: 0,
        title: 'Bài 1: Khóa chính, khóa ngoại và toàn vẹn dữ liệu',
        content: 'Tìm hiểu PRIMARY KEY, FOREIGN KEY và các hành vi ON DELETE CASCADE / SET NULL.',
        video_path: 'https://www.youtube.com/watch?v=OqjJjpjDRLc'
      },
      {
        chapterIndex: 0,
        title: 'Bài 2: Chuẩn hóa dữ liệu từ 1NF đến 3NF',
        content: 'Loại bỏ dư thừa dữ liệu và phụ thuộc bắc cầu trong thiết kế cơ sở dữ liệu.',
        video_path: 'https://www.youtube.com/watch?v=5kiMg7GXAsY'
      },
      {
        chapterIndex: 1,
        title: 'Bài 3: Các loại JOIN và tổng hợp dữ liệu GROUP BY',
        content: 'Ứng dụng INNER JOIN, LEFT JOIN kết hợp COUNT, SUM để thống kê tiến độ học tập.',
        video_path: 'https://www.youtube.com/watch?v=uNj8jm_LDN4'
      },
      {
        chapterIndex: 1,
        title: 'Bài 4: Đánh chỉ mục (Index) và lệnh EXPLAIN',
        content: 'Cách tạo Composite Index hợp lý và phân tích kế hoạch thực thi truy vấn.',
        video_path: 'https://www.youtube.com/watch?v=t0grczCICMk'
      }
    ],
    questions: [
      { q: 'Khóa chính (PRIMARY KEY) có tính chất gì?', correct: 'Duy nhất và không được NULL', wrong: ['Cho phép trùng lặp', 'Có thể chứa NULL', 'Không cần đánh chỉ mục'] },
      { q: 'ON DELETE CASCADE có tác dụng gì?', correct: 'Tự động xóa bản ghi con khi bản ghi cha bị xóa', wrong: ['Ngăn không cho xóa bảng', 'Gán giá trị NULL cho khóa ngoại', 'Sao lưu dữ liệu tự động'] },
      { q: 'Kiểu JOIN nào giữ lại toàn bộ bản ghi của bảng bên trái?', correct: 'LEFT JOIN', wrong: ['INNER JOIN', 'RIGHT JOIN', 'CROSS JOIN'] },
      { q: 'Dạng chuẩn 3NF yêu cầu điều kiện gì?', correct: 'Đạt 2NF và không có phụ thuộc bắc cầu', wrong: ['Chỉ cần có khóa chính', 'Không cần khóa ngoại', 'Tất cả cột đều là VARCHAR'] },
      { q: 'Lệnh nào dùng để kiểm tra kế hoạch thực thi của câu SELECT trong MySQL?', correct: 'EXPLAIN', wrong: ['DESCRIBE TABLE', 'SHOW INDEX', 'ANALYZE LOG'] },
      { q: 'Kiểu dữ liệu nào phù hợp nhất để lưu cờ đúng/sai (0 hoặc 1) trong MySQL?', correct: 'TINYINT(1)', wrong: ['TEXT', 'FLOAT', 'DATETIME'] },
      { q: 'Ràng buộc UNIQUE dùng để làm gì?', correct: 'Đảm bảo giá trị không bị trùng lặp trong cột/nhóm cột', wrong: ['Tự tăng giá trị', 'Liên kết hai bảng', 'Mã hóa dữ liệu'] },
      { q: 'Hàm nào dùng để đếm số lượng bản ghi trong SQL?', correct: 'COUNT()', wrong: ['TOTAL()', 'LENGTH()', 'SUM_ROWS()'] },
      { q: 'Công cụ nào trong dự án dùng để quản lý phiên bản tạo bảng?', correct: 'Knex Migrations', wrong: ['React Router', 'Multer', 'Axios'] },
      { q: 'Engine mặc định hỗ trợ khóa ngoại và Transaction trong MySQL là gì?', correct: 'InnoDB', wrong: ['MyISAM', 'MEMORY', 'CSV'] }
    ]
  }
];

const loadBcrypt = () => {
  const candidates = ['bcrypt', '../../backend/node_modules/bcrypt'];
  for (const candidate of candidates) {
    try {
      const bcrypt = require(candidate);
      if (bcrypt && typeof bcrypt.hash === 'function') return bcrypt;
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }
  throw new Error('Không tìm thấy bcrypt. Hãy cài dependencies backend trước khi chạy seed.');
};

const ensureCategory = async (trx, name) => {
  const existing = await trx('categories').where({ name }).first();
  if (existing) return existing.id;
  const [insertedId] = await trx('categories').insert({ name });
  return insertedId;
};

const ensureUser = async (trx, user, hashedPassword) => {
  const existing = await trx('users').where({ email: user.email }).first();
  if (existing) {
    await trx('users')
      .where({ id: existing.id })
      .update({
        name: user.name,
        password: hashedPassword,
        role: user.role,
        is_locked: 0,
        status: 'active',
        must_change_password: false
      });
    return existing.id;
  }

  const [insertedId] = await trx('users').insert({
    name: user.name,
    email: user.email,
    password: hashedPassword,
    role: user.role,
    is_locked: 0,
    status: 'active',
    must_change_password: false
  });
  return insertedId;
};

/**
 * @param { import('knex').Knex } knex
 */
exports.seed = async function (knex) {
  const bcrypt = loadBcrypt();
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  await knex.transaction(async (trx) => {
    const categoryMap = {};
    for (const catName of DEMO_CATEGORIES) {
      categoryMap[catName] = await ensureCategory(trx, catName);
    }

    const userMap = {};
    for (const u of DEMO_USERS) {
      userMap[u.role] = await ensureUser(trx, u, hashedPassword);
    }

    const teacherId = userMap.teacher;
    const studentId = userMap.student;

    // Xóa 2 khóa demo cũ (nếu đã tồn tại từ lần chạy trước) để chạy lại sạch sẽ
    const demoTitles = DEMO_COURSES.map((c) => c.title);
    await trx('courses').whereIn('title', demoTitles).del();

    for (const courseDef of DEMO_COURSES) {
      const [courseId] = await trx('courses').insert({
        title: courseDef.title,
        description: courseDef.description,
        category_id: categoryMap[courseDef.categoryName],
        user_id: teacherId,
        price_course: 0,
        quiz_minutes: courseDef.quiz_minutes,
        status: 'public'
      });

      const chapterIds = [];
      for (let i = 0; i < courseDef.chapters.length; i += 1) {
        const [chapId] = await trx('chapters').insert({
          course_id: courseId,
          title: courseDef.chapters[i],
          position: i + 1
        });
        chapterIds.push(chapId);
      }

      const lessonRows = courseDef.lessons.map((lesson, idx) => ({
        course_id: courseId,
        chapter_id: chapterIds[lesson.chapterIndex],
        title: lesson.title,
        content: lesson.content,
        status: 'public',
        video_path: lesson.video_path,
        position: idx + 1
      }));
      await trx('lessons').insert(lessonRows);

      const questionRows = courseDef.questions.map((item) => ({
        course_id: courseId,
        content: item.q,
        correct_answer: item.correct,
        false_answer: item.wrong[0],
        false_answer_2: item.wrong[1],
        false_answer_3: item.wrong[2]
      }));
      await trx('questions').insert(questionRows);

      await trx('enrollments').insert({
        user_id: studentId,
        course_id: courseId
      });
    }
  });

  console.info('[seed-demo] Đã khởi tạo thành công 3 tài khoản demo và 2 khóa học demo.');
};
