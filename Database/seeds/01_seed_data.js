/**
 * Seed dữ liệu mẫu cho hệ thống quản lý học tập.
 *
 * - 5 danh mục
 * - 19 người dùng: 1 admin (id 1), 3 giảng viên (id 2-4), 15 học viên (id 5-19)
 * - 8 khóa học, mỗi khóa 5 bài học và 10 câu hỏi trắc nghiệm
 * - Ghi danh, một số lượt làm bài, tiến độ bài học, bình luận và thảo luận mẫu
 *
 * Mật khẩu của tất cả tài khoản demo: 12345678
 * Seed sẽ băm mật khẩu bằng bcrypt nếu tìm thấy module, ngược lại giữ nguyên chuỗi.
 *
 * Chạy: cd Database && npx knex seed:run
 */

const PASSWORD = '12345678';

const CATEGORIES = [
  { id: 1, name: 'Lập trình Web' },
  { id: 2, name: 'Lập trình Mobile' },
  { id: 3, name: 'Cơ sở dữ liệu' },
  { id: 4, name: 'Khoa học dữ liệu' },
  { id: 5, name: 'Thiết kế UI/UX' }
];

const STUDENT_NAMES = [
  'Nguyễn Minh Anh',
  'Trần Quốc Bảo',
  'Lê Thị Chi',
  'Phạm Đức Duy',
  'Hoàng Thu Hà',
  'Vũ Văn Hải',
  'Đặng Thị Hạnh',
  'Bùi Tuấn Kiệt',
  'Ngô Thị Lan',
  'Đỗ Văn Long',
  'Trịnh Thị Mai',
  'Lý Hoàng Nam',
  'Phan Thị Ngọc',
  'Cao Văn Phúc',
  'Mai Thị Quỳnh'
];

const COURSES = [
  {
    id: 1,
    title: 'Node.js & ExpressJS Cơ bản',
    description: 'Xây dựng REST API với Node.js và ExpressJS từ con số không.',
    category_id: 1,
    user_id: 2,
    quiz_minutes: 30,
    lessons: [
      'Giới thiệu Node.js và môi trường runtime',
      'Module, npm và quản lý gói',
      'Xây dựng HTTP server với ExpressJS',
      'Routing, middleware và xử lý lỗi',
      'Kết nối MySQL và xây dựng REST API'
    ],
    questions: [
      {
        q: 'Node.js được xây dựng trên engine JavaScript nào?',
        correct: 'Engine V8 của Chrome',
        wrong: ['SpiderMonkey của Firefox', 'JavaScriptCore của Safari', 'Chakra của Edge']
      },
      {
        q: 'Module nào của Node.js dùng để tạo HTTP server mà không cần thư viện ngoài?',
        correct: 'Module http',
        wrong: ['Module fs', 'Module path', 'Module url']
      },
      {
        q: 'ExpressJS là gì?',
        correct: 'Framework web chạy trên Node.js',
        wrong: ['Hệ quản trị cơ sở dữ liệu', 'Trình duyệt ảo để kiểm thử', 'Trình quản lý gói npm']
      },
      {
        q: 'Middleware trong ExpressJS nhận bộ tham số nào?',
        correct: '(req, res, next)',
        wrong: ['(req, res)', '(err, req, res)', '(req, next, err)']
      },
      {
        q: 'Lệnh nào dùng để cài ExpressJS vào project?',
        correct: 'npm install express',
        wrong: ['npm run express', 'node install express', 'npm get expressjs']
      },
      {
        q: 'Middleware nào giúp đọc dữ liệu JSON từ body request?',
        correct: 'express.json()',
        wrong: ['body.json()', 'app.useJson()', 'express.parseJson()']
      },
      {
        q: 'Mã trạng thái HTTP nào phù hợp khi tạo mới tài nguyên thành công?',
        correct: '201 Created',
        wrong: ['200 OK', '204 No Content', '302 Found']
      },
      {
        q: 'Thuộc tính req.params chứa dữ liệu gì?',
        correct: 'Tham số động trên đường dẫn URL',
        wrong: ['Dữ liệu form gửi lên', 'Chuỗi truy vấn sau dấu hỏi', 'Toàn bộ header của request']
      },
      {
        q: 'Thư viện nào thường được dùng để kết nối MySQL trong Node.js?',
        correct: 'mysql2',
        wrong: ['mongoose', 'pg-mysql', 'sqlite3']
      },
      {
        q: 'Biến môi trường trong Node.js được đọc qua đối tượng nào?',
        correct: 'process.env',
        wrong: ['global.env', 'app.config', 'env.process']
      }
    ]
  },
  {
    id: 2,
    title: 'ReactJS Nâng cao',
    description: 'Hook, Context API, tối ưu re-render và bảo vệ route theo vai trò.',
    category_id: 1,
    user_id: 2,
    quiz_minutes: 45,
    lessons: [
      'Ôn tập JSX, component và props',
      'Quản lý state với useState và useReducer',
      'useEffect, gọi API và xử lý bất đồng bộ',
      'Context API và tối ưu re-render',
      'React Router và bảo vệ route theo vai trò'
    ],
    questions: [
      {
        q: 'JSX là gì?',
        correct: 'Cú pháp mở rộng cho phép viết HTML trong JavaScript',
        wrong: ['Một ngôn ngữ lập trình mới', 'Trình biên dịch CSS', 'Thư viện quản lý state']
      },
      {
        q: 'Hook nào dùng để quản lý state trong function component?',
        correct: 'useState',
        wrong: ['useEffect', 'useContext', 'useMemo']
      },
      {
        q: 'useEffect với mảng phụ thuộc rỗng chạy khi nào?',
        correct: 'Một lần sau lần render đầu tiên',
        wrong: ['Mỗi lần component render', 'Chỉ khi component unmount', 'Mỗi khi props thay đổi']
      },
      {
        q: 'Thuộc tính key trong danh sách React dùng để làm gì?',
        correct: 'Giúp React nhận diện phần tử khi render lại',
        wrong: ['Tạo id cho thẻ HTML', 'Sắp xếp danh sách tăng dần', 'Khai báo kiểu dữ liệu cho props']
      },
      {
        q: 'Context API giải quyết vấn đề gì?',
        correct: 'Chia sẻ dữ liệu mà không phải truyền props qua nhiều tầng',
        wrong: ['Tối ưu dung lượng bundle', 'Thay thế hoàn toàn fetch', 'Quản lý route của ứng dụng']
      },
      {
        q: 'Thư viện định tuyến phổ biến nhất cho React là gì?',
        correct: 'react-router-dom',
        wrong: ['react-route', 'express-router', 'next-router-dom']
      },
      {
        q: 'Cách nào giúp tránh render lại component khi props không đổi?',
        correct: 'Bọc component bằng React.memo',
        wrong: ['Bọc component bằng React.lazy', 'Dùng React.createRef', 'Dùng React.useRef']
      },
      {
        q: 'Props trong React là gì?',
        correct: 'Dữ liệu truyền từ component cha xuống component con',
        wrong: ['State nội bộ của component', 'Hàm xử lý sự kiện toàn cục', 'Cấu hình của webpack']
      },
      {
        q: 'useReducer phù hợp trong trường hợp nào?',
        correct: 'State phức tạp với nhiều loại hành động',
        wrong: ['State chỉ là một chuỗi đơn giản', 'Cần gọi API sau mỗi lần render', 'Cần tạo tham chiếu tới DOM']
      },
      {
        q: 'Cách đúng để bảo vệ route theo vai trò người dùng?',
        correct: 'Kiểm tra quyền trong component bọc route',
        wrong: ['Ẩn nút bằng CSS', 'Xóa route khỏi trình duyệt', 'Chỉ cần lưu token vào localStorage']
      }
    ]
  },
  {
    id: 3,
    title: 'Lập trình Flutter Cross-platform',
    description: 'Tạo ứng dụng iOS và Android từ một mã nguồn Dart.',
    category_id: 2,
    user_id: 3,
    quiz_minutes: 30,
    lessons: [
      'Cài đặt Flutter và tạo project đầu tiên',
      'Widget, layout và hot reload',
      'Điều hướng và truyền dữ liệu giữa màn hình',
      'Gọi API và xử lý dữ liệu JSON',
      'Quản lý state với Provider'
    ],
    questions: [
      {
        q: 'Flutter sử dụng ngôn ngữ lập trình nào?',
        correct: 'Dart',
        wrong: ['Kotlin', 'Swift', 'JavaScript']
      },
      {
        q: 'Widget nào dùng để sắp xếp các phần tử theo hàng ngang?',
        correct: 'Row',
        wrong: ['Column', 'Stack', 'ListView']
      },
      {
        q: 'Hot reload trong Flutter có tác dụng gì?',
        correct: 'Cập nhật giao diện khi ứng dụng đang chạy',
        wrong: ['Biên dịch lại toàn bộ ứng dụng', 'Khởi động lại máy ảo', 'Tải ứng dụng lên store']
      },
      {
        q: 'Widget gốc thường dùng để bọc toàn bộ ứng dụng Flutter là gì?',
        correct: 'MaterialApp',
        wrong: ['Scaffold', 'Container', 'WidgetApp']
      },
      {
        q: 'Phương thức setState dùng để làm gì?',
        correct: 'Báo Flutter vẽ lại giao diện khi state thay đổi',
        wrong: ['Tạo state dùng chung toàn cục', 'Lưu state xuống ổ đĩa', 'Xóa toàn bộ state của widget']
      },
      {
        q: 'Thành phần nào dùng để điều hướng giữa các màn hình?',
        correct: 'Navigator',
        wrong: ['RouteView', 'ScreenManager', 'RouteStack']
      },
      {
        q: 'Thư viện chính thức nào thường dùng để gọi API trong Flutter?',
        correct: 'http',
        wrong: ['axios', 'requests', 'fetch']
      },
      {
        q: 'FutureBuilder dùng để làm gì?',
        correct: 'Hiển thị giao diện theo kết quả của một Future',
        wrong: ['Tạo Future từ Stream', 'Quản lý state toàn cục', 'Xây dựng layout responsive']
      },
      {
        q: 'Tệp pubspec.yaml dùng để làm gì?',
        correct: 'Khai báo dependency và tài nguyên của ứng dụng',
        wrong: ['Cấu hình máy ảo Android', 'Định nghĩa route màn hình', 'Lưu trữ dữ liệu SQLite']
      },
      {
        q: 'Thư viện quản lý state phổ biến trong Flutter là gì?',
        correct: 'Provider',
        wrong: ['Redux', 'Vuex', 'MobX-React']
      }
    ]
  },
  {
    id: 4,
    title: 'Lập trình Android với Kotlin',
    description: 'Phát triển ứng dụng Android thuần Kotlin với Jetpack.',
    category_id: 2,
    user_id: 3,
    quiz_minutes: 40,
    lessons: [
      'Kotlin cơ bản cho lập trình Android',
      'Activity, Fragment và vòng đời',
      'RecyclerView và hiển thị danh sách',
      'Room Database và lưu trữ cục bộ',
      'Retrofit và gọi API bất đồng bộ'
    ],
    questions: [
      {
        q: 'Kotlin chạy trên nền tảng nào?',
        correct: 'Máy ảo Java (JVM)',
        wrong: ['Chỉ trình duyệt web', 'Máy ảo Python', 'Nhân Linux thuần']
      },
      {
        q: 'Từ khóa nào khai báo biến không thể thay đổi giá trị?',
        correct: 'val',
        wrong: ['var', 'let', 'const']
      },
      {
        q: 'Activity trong Android là gì?',
        correct: 'Màn hình chứa giao diện người dùng',
        wrong: ['Tiến trình chạy nền', 'Cơ sở dữ liệu cục bộ', 'Dịch vụ mạng']
      },
      {
        q: 'RecyclerView được dùng để làm gì?',
        correct: 'Hiển thị danh sách lớn một cách hiệu quả',
        wrong: ['Vẽ biểu đồ', 'Lưu dữ liệu vào SQLite', 'Gọi API từ xa']
      },
      {
        q: 'Room Database thuộc bộ thư viện nào?',
        correct: 'Android Jetpack',
        wrong: ['Firebase', 'Retrofit', 'Glide']
      },
      {
        q: 'Retrofit được dùng để làm gì?',
        correct: 'Gọi REST API',
        wrong: ['Vẽ giao diện', 'Quản lý hình ảnh', 'Nén dữ liệu']
      },
      {
        q: 'Phương thức onCreate() của Activity được gọi khi nào?',
        correct: 'Khi Activity được khởi tạo',
        wrong: ['Khi Activity bị hủy', 'Khi người dùng nhấn back', 'Khi ứng dụng bị kill']
      },
      {
        q: 'Layout nào sắp xếp các view theo chiều dọc?',
        correct: 'LinearLayout',
        wrong: ['FrameLayout', 'ConstraintLayout', 'RelativeLayout']
      },
      {
        q: 'Intent được dùng để làm gì?',
        correct: 'Chuyển màn hình hoặc truyền dữ liệu',
        wrong: ['Lưu trữ key-value', 'Định nghĩa theme', 'Quản lý quyền ứng dụng']
      },
      {
        q: 'Gradle trong dự án Android dùng để làm gì?',
        correct: 'Quản lý build và dependency',
        wrong: ['Quản lý cơ sở dữ liệu', 'Thiết kế giao diện', 'Kiểm thử API']
      }
    ]
  },
  {
    id: 5,
    title: 'Cơ sở dữ liệu MySQL từ A-Z',
    description: 'Thiết kế bảng, viết truy vấn và tối ưu hiệu năng với MySQL.',
    category_id: 3,
    user_id: 4,
    quiz_minutes: 25,
    lessons: [
      'Tổng quan cơ sở dữ liệu quan hệ',
      'Thiết kế bảng, khóa chính và khóa ngoại',
      'Truy vấn SELECT, JOIN và GROUP BY',
      'Chỉ mục và tối ưu truy vấn',
      'Transaction, phân quyền và sao lưu'
    ],
    questions: [
      {
        q: 'Khóa chính (PRIMARY KEY) có đặc điểm gì?',
        correct: 'Giá trị duy nhất và không được NULL',
        wrong: ['Cho phép trùng lặp giá trị', 'Có thể NULL ở nhiều dòng', 'Chỉ là chỉ mục tìm kiếm']
      },
      {
        q: 'Lệnh nào lấy 10 dòng đầu tiên trong MySQL?',
        correct: 'SELECT ... LIMIT 10',
        wrong: ['SELECT ... TOP 10', 'SELECT ... FIRST 10', 'SELECT ... ROWS 10']
      },
      {
        q: 'Kiểu JOIN nào trả về toàn bộ dòng của bảng bên trái?',
        correct: 'LEFT JOIN',
        wrong: ['INNER JOIN', 'CROSS JOIN', 'RIGHT JOIN']
      },
      {
        q: 'Chỉ mục (INDEX) mang lại lợi ích gì?',
        correct: 'Tăng tốc truy vấn tìm kiếm',
        wrong: ['Giảm dung lượng ổ đĩa', 'Tự động sao lưu dữ liệu', 'Mã hóa dữ liệu trong bảng']
      },
      {
        q: 'Kiểu dữ liệu nào phù hợp nhất để lưu giá tiền?',
        correct: 'DECIMAL',
        wrong: ['FLOAT', 'TEXT', 'BOOLEAN']
      },
      {
        q: 'Hàm nào thường dùng cùng GROUP BY để đếm số dòng?',
        correct: 'COUNT()',
        wrong: ['SUM_ROW()', 'LEN()', 'TOTAL()']
      },
      {
        q: 'Transaction đảm bảo tính chất nào sau đây?',
        correct: 'Tính nguyên tử (Atomicity)',
        wrong: ['Tăng tốc độ đọc dữ liệu', 'Giảm dung lượng file log', 'Tự động phân quyền người dùng']
      },
      {
        q: 'Lệnh nào dùng để cấp quyền cho người dùng MySQL?',
        correct: 'GRANT',
        wrong: ['ALLOW', 'PERMIT', 'ASSIGN']
      },
      {
        q: 'Khóa ngoại (FOREIGN KEY) dùng để làm gì?',
        correct: 'Đảm bảo tính tham chiếu giữa các bảng',
        wrong: ['Tăng tốc sắp xếp dữ liệu', 'Mã hóa cột dữ liệu', 'Chia bảng thành nhiều file']
      },
      {
        q: 'Lệnh EXPLAIN dùng để làm gì?',
        correct: 'Xem kế hoạch thực thi của truy vấn',
        wrong: ['Sao lưu cơ sở dữ liệu', 'Tạo bảng mới từ bảng cũ', 'Xóa các dòng trùng lặp']
      }
    ]
  },
  {
    id: 6,
    title: 'Phân tích Dữ liệu với Python',
    description: 'Xử lý và phân tích dữ liệu với NumPy, Pandas và Matplotlib.',
    category_id: 4,
    user_id: 4,
    quiz_minutes: 60,
    lessons: [
      'NumPy và thao tác trên mảng số',
      'Pandas: Series và DataFrame',
      'Làm sạch dữ liệu thiếu và trùng lặp',
      'Trực quan hóa dữ liệu với Matplotlib',
      'Phân tích dữ liệu theo nhóm'
    ],
    questions: [
      {
        q: 'Thư viện nào chuyên xử lý mảng số hiệu quả trong Python?',
        correct: 'NumPy',
        wrong: ['Django', 'Flask', 'Requests']
      },
      {
        q: 'Cấu trúc dữ liệu hai chiều của Pandas tên là gì?',
        correct: 'DataFrame',
        wrong: ['Series', 'Ndarray', 'DictFrame']
      },
      {
        q: 'Hàm nào dùng để đọc tệp CSV trong Pandas?',
        correct: 'pd.read_csv()',
        wrong: ['pd.load_csv()', 'pd.open_csv()', 'pd.import_csv()']
      },
      {
        q: 'Phương thức df.dropna() làm gì?',
        correct: 'Xóa các dòng có giá trị thiếu',
        wrong: ['Điền giá trị thiếu', 'Đổi tên cột', 'Sắp xếp lại dữ liệu']
      },
      {
        q: 'Phương thức df.describe() cung cấp thông tin gì?',
        correct: 'Thống kê mô tả các cột số',
        wrong: ['Vẽ biểu đồ cột', 'Xuất dữ liệu ra Excel', 'Kiểm tra kiểu dữ liệu từng cột']
      },
      {
        q: 'Matplotlib được dùng để làm gì?',
        correct: 'Trực quan hóa dữ liệu',
        wrong: ['Xử lý ảnh', 'Kết nối cơ sở dữ liệu', 'Xây dựng API']
      },
      {
        q: 'df.groupby("city").mean() trả về kết quả gì?',
        correct: 'Giá trị trung bình theo từng city',
        wrong: ['Số dòng theo từng city', 'Các dòng bị thiếu dữ liệu', 'Danh sách tên cột']
      },
      {
        q: 'Cách chọn cột "age" trong DataFrame là gì?',
        correct: "df['age']",
        wrong: ['df.age()', 'df->age', 'df.get(age)']
      },
      {
        q: 'Phương thức df.duplicated() dùng để làm gì?',
        correct: 'Phát hiện các dòng trùng lặp',
        wrong: ['Xóa các dòng trùng lặp', 'Đếm số cột', 'Sắp xếp dữ liệu']
      },
      {
        q: 'Kiểu dữ liệu của một cột trong Pandas được gọi là gì?',
        correct: 'dtype',
        wrong: ['schema', 'vartype', 'fieldtype']
      }
    ]
  },
  {
    id: 7,
    title: 'Figma Thiết kế UI/UX Chuyên nghiệp',
    description: 'Thiết kế giao diện hiện đại bằng Figma và bàn giao cho lập trình viên.',
    category_id: 5,
    user_id: 2,
    quiz_minutes: 20,
    lessons: [
      'Làm quen giao diện Figma và frame',
      'Auto layout và component',
      'Hệ thống màu, chữ và design token',
      'Prototype và luồng tương tác',
      'Bàn giao thiết kế cho lập trình viên'
    ],
    questions: [
      {
        q: 'Frame trong Figma có vai trò gì?',
        correct: 'Khung chứa và giới hạn nội dung thiết kế',
        wrong: ['Một trang web đã xuất bản', 'Một component dùng chung', 'Một plugin của Figma']
      },
      {
        q: 'Auto layout giúp ích điều gì?',
        correct: 'Tự động sắp xếp và giãn khoảng cách phần tử',
        wrong: ['Tạo hiệu ứng chuyển động', 'Xuất file PNG', 'Đồng bộ font chữ hệ thống']
      },
      {
        q: 'Component trong Figma dùng để làm gì?',
        correct: 'Tái sử dụng phần tử giao diện',
        wrong: ['Tăng dung lượng tệp thiết kế', 'Tạo cơ sở dữ liệu', 'Quản lý thành viên nhóm']
      },
      {
        q: 'Design token là gì?',
        correct: 'Biến lưu màu, chữ và khoảng cách dùng chung',
        wrong: ['Mã xác thực gọi API', 'Tên tài khoản Figma', 'Định dạng ảnh khi xuất']
      },
      {
        q: 'Prototype trong Figma dùng để làm gì?',
        correct: 'Tạo luồng tương tác mô phỏng',
        wrong: ['Viết mã HTML', 'Nén hình ảnh', 'Quản lý phiên bản Git']
      },
      {
        q: 'Plugin Figma được viết bằng ngôn ngữ nào?',
        correct: 'JavaScript',
        wrong: ['Python', 'Kotlin', 'PHP']
      },
      {
        q: 'Đơn vị kích thước phổ biến khi thiết kế web là gì?',
        correct: 'px',
        wrong: ['cm', 'kg', 'm2']
      },
      {
        q: 'Lưới 12 cột mang lại lợi ích gì?',
        correct: 'Căn chỉnh bố cục nhất quán giữa các màn hình',
        wrong: ['Tăng tốc độ tải trang', 'Mã hóa dữ liệu', 'Tạo hiệu ứng hover']
      },
      {
        q: 'Khi bàn giao thiết kế, lập trình viên cần gì nhất?',
        correct: 'Thông số kích thước, màu và asset',
        wrong: ['Tài khoản Figma của khách hàng', 'File Photoshop gốc', 'Mật khẩu plugin']
      },
      {
        q: 'Constraint trong Figma dùng để làm gì?',
        correct: 'Giữ vị trí phần tử khi đổi kích thước frame',
        wrong: ['Đặt mật khẩu cho tệp thiết kế', 'Giới hạn số trang', 'Khóa tài khoản thành viên']
      }
    ]
  },
  {
    id: 8,
    title: 'Machine Learning Cơ bản',
    description: 'Nhập môn học máy với scikit-learn: tiền xử lý, mô hình và đánh giá.',
    category_id: 4,
    user_id: 3,
    quiz_minutes: 45,
    lessons: [
      'Tổng quan học máy và bài toán phân loại',
      'Tiền xử lý dữ liệu với scikit-learn',
      'Hồi quy tuyến tính và đánh giá sai số',
      'Cây quyết định và rừng ngẫu nhiên',
      'Đánh giá mô hình với cross-validation'
    ],
    questions: [
      {
        q: 'Học có giám sát (supervised learning) cần loại dữ liệu nào?',
        correct: 'Dữ liệu đã được gắn nhãn',
        wrong: ['Dữ liệu hoàn toàn không nhãn', 'Chỉ cần cấu hình GPU mạnh', 'Không cần dữ liệu huấn luyện']
      },
      {
        q: 'Bài toán dự đoán giá nhà thuộc loại nào?',
        correct: 'Hồi quy (Regression)',
        wrong: ['Phân cụm', 'Phân loại', 'Giảm chiều dữ liệu']
      },
      {
        q: 'Hàm train_test_split dùng để làm gì?',
        correct: 'Chia dữ liệu thành tập train và test',
        wrong: ['Chuẩn hóa dữ liệu', 'Đổi tên các cột', 'Lưu mô hình xuống ổ đĩa']
      },
      {
        q: 'Overfitting là hiện tượng gì?',
        correct: 'Mô hình học quá khớp dữ liệu huấn luyện',
        wrong: ['Mô hình dự đoán quá chậm', 'Dữ liệu bị thiếu nhãn', 'Mô hình thiếu tham số']
      },
      {
        q: 'Confusion matrix dùng để làm gì?',
        correct: 'Đánh giá mô hình phân loại',
        wrong: ['Nén dữ liệu', 'Tăng tốc huấn luyện', 'Chia tập dữ liệu']
      },
      {
        q: 'Random Forest được tạo thành từ nhiều thành phần nào?',
        correct: 'Cây quyết định',
        wrong: ['Mạng nơ-ron', 'Máy vectơ hỗ trợ', 'Cụm K-means']
      },
      {
        q: 'Thư viện học máy phổ biến trong Python là gì?',
        correct: 'scikit-learn',
        wrong: ['Laravel', 'Spring Boot', 'Express']
      },
      {
        q: 'Chuẩn hóa dữ liệu (scaling) giúp gì?',
        correct: 'Đưa các đặc trưng về cùng thang đo',
        wrong: ['Tăng số dòng dữ liệu', 'Xóa các cột phân loại', 'Tạo nhãn mới cho dữ liệu']
      },
      {
        q: 'Độ chính xác (accuracy) được tính như thế nào?',
        correct: 'Tỉ lệ dự đoán đúng trên tổng số mẫu',
        wrong: ['Thời gian huấn luyện mô hình', 'Số lượng đặc trưng', 'Dung lượng tệp mô hình']
      },
      {
        q: 'K-means là thuật toán thuộc nhóm nào?',
        correct: 'Phân cụm không giám sát',
        wrong: ['Hồi quy có giám sát', 'Phân loại ảnh', 'Giảm chiều dữ liệu']
      }
    ]
  }
];

const ENROLLMENTS = [
  { user_id: 5, course_id: 1 },
  { user_id: 5, course_id: 2 },
  { user_id: 6, course_id: 1 },
  { user_id: 6, course_id: 5 },
  { user_id: 7, course_id: 3 },
  { user_id: 8, course_id: 5 },
  { user_id: 9, course_id: 6 },
  { user_id: 10, course_id: 7 },
  { user_id: 11, course_id: 1 },
  { user_id: 12, course_id: 2 },
  { user_id: 13, course_id: 3 },
  { user_id: 14, course_id: 6 },
  { user_id: 15, course_id: 1 },
  { user_id: 16, course_id: 5 },
  { user_id: 17, course_id: 2 },
  { user_id: 18, course_id: 7 },
  { user_id: 19, course_id: 6 }
];

// Mỗi khóa có 10 câu nên điểm là số nguyên từ 0 đến 10.
const QUIZ_ATTEMPTS = [
  { user_id: 5, course_id: 1, score: 8, started_at: '2026-11-10 09:00:00', submitted_at: '2026-11-10 09:22:00' },
  { user_id: 5, course_id: 1, score: 9, started_at: '2026-11-12 14:00:00', submitted_at: '2026-11-12 14:25:00' },
  { user_id: 5, course_id: 2, score: 7, started_at: '2026-11-11 10:00:00', submitted_at: '2026-11-11 10:20:00' },
  { user_id: 6, course_id: 1, score: 6, started_at: '2026-11-09 08:30:00', submitted_at: '2026-11-09 08:48:00' },
  { user_id: 7, course_id: 3, score: 9, started_at: '2026-11-10 19:00:00', submitted_at: '2026-11-10 19:18:00' },
  { user_id: 8, course_id: 5, score: 6, started_at: '2026-11-12 20:00:00', submitted_at: '2026-11-12 20:15:00' },
  { user_id: 9, course_id: 6, score: 8, started_at: '2026-11-14 09:30:00', submitted_at: '2026-11-14 09:55:00' },
  { user_id: 11, course_id: 1, score: 7, started_at: '2026-11-15 16:00:00', submitted_at: '2026-11-15 16:21:00' },
  { user_id: 15, course_id: 1, score: 10, started_at: '2026-11-17 13:00:00', submitted_at: '2026-11-17 13:19:00' }
];

const LESSON_PROGRESS = [
  { user_id: 5, lesson_id: 1, is_completed: true },
  { user_id: 5, lesson_id: 2, is_completed: true },
  { user_id: 5, lesson_id: 3, is_completed: true },
  { user_id: 6, lesson_id: 1, is_completed: true },
  { user_id: 7, lesson_id: 11, is_completed: true },
  { user_id: 9, lesson_id: 26, is_completed: true },
  { user_id: 11, lesson_id: 1, is_completed: true },
  { user_id: 15, lesson_id: 1, is_completed: true }
];

// Đánh giá khóa học: chỉ những học viên đã ghi danh mới bình luận.
const COMMENTS = [
  { course_id: 1, user_id: 5, rating: 5, content: 'Khóa học dễ hiểu, phần middleware được giải thích rất rõ.' },
  { course_id: 1, user_id: 6, rating: 4, content: 'Nội dung ổn, mong có thêm bài tập về xử lý lỗi.' },
  { course_id: 1, user_id: 11, rating: 5, content: 'Giảng viên trả lời câu hỏi nhanh, ví dụ sát thực tế.' },
  { course_id: 2, user_id: 5, rating: 4, content: 'Phần Context API hơi nhanh nhưng ví dụ minh họa tốt.' },
  { course_id: 2, user_id: 12, rating: 5, content: 'Rất hữu ích cho đồ án, nhất là cách bảo vệ route theo vai trò.' },
  { course_id: 3, user_id: 7, rating: 5, content: 'Hot reload tiện thật, bài giảng dễ theo dõi.' },
  { course_id: 3, user_id: 13, rating: 5, content: 'Mình làm được ứng dụng đầu tiên sau khóa này.' },
  { course_id: 5, user_id: 6, rating: 4, content: 'Bài về index giúp mình tối ưu truy vấn rõ rệt.' },
  { course_id: 5, user_id: 16, rating: 3, content: 'Nội dung tốt nhưng âm thanh video hơi nhỏ.' },
  { course_id: 6, user_id: 9, rating: 5, content: 'Ví dụ Pandas sát với dữ liệu thực tế.' },
  { course_id: 7, user_id: 10, rating: 4, content: 'Design token giải thích dễ hiểu, cần thêm bài về responsive.' }
];

// Thảo luận theo bài học: câu hỏi gốc có parent_id = null, trả lời trỏ tới id câu hỏi gốc.
const DISCUSSIONS = [
  { id: 1, lesson_id: 3, user_id: 5, parent_id: null, content: 'Thầy cho em hỏi middleware xác thực nên đặt trước hay sau route ạ?' },
  { id: 2, lesson_id: 3, user_id: 2, parent_id: 1, content: 'Em đặt trước route cần bảo vệ, nhớ gọi next() khi hợp lệ.' },
  { id: 3, lesson_id: 1, user_id: 6, parent_id: null, content: 'Học Node.js có cần nắm JavaScript trước không ạ?' },
  { id: 4, lesson_id: 1, user_id: 2, parent_id: 3, content: 'Nên nắm cơ bản JavaScript trước, khóa này chủ yếu dùng cú pháp ES6.' },
  { id: 5, lesson_id: 11, user_id: 7, parent_id: null, content: 'Làm sao chạy ứng dụng Flutter trên máy thật ạ?' },
  { id: 6, lesson_id: 11, user_id: 3, parent_id: 5, content: 'Em bật gỡ lỗi USB trên điện thoại rồi chọn thiết bị khi chạy flutter run.' },
  { id: 7, lesson_id: 21, user_id: 6, parent_id: null, content: 'Khi nào nên dùng LEFT JOIN thay vì INNER JOIN?' },
  { id: 8, lesson_id: 21, user_id: 4, parent_id: 7, content: 'Dùng LEFT JOIN khi vẫn muốn giữ dòng bảng trái dù không có dữ liệu khớp.' },
  { id: 9, lesson_id: 26, user_id: 9, parent_id: null, content: 'Dữ liệu thiếu nhiều thì nên xóa hay điền bù ạ?' },
  { id: 10, lesson_id: 26, user_id: 4, parent_id: 9, content: 'Tùy tỉ lệ thiếu: ít thì điền bằng median, nhiều thì cân nhắc bỏ cột.' }
];

// Tìm bcrypt: ưu tiên cài trong Database, sau đó tới backend.
const loadBcrypt = () => {
  const candidates = ['bcrypt', '../../backend/node_modules/bcrypt'];

  for (const candidate of candidates) {
    try {
      const mod = require(candidate);
      if (mod && typeof mod.hash === 'function') {
        return mod;
      }
    } catch (error) {
      // Không có module này, thử ứng viên kế tiếp.
    }
  }

  return null;
};

const buildUsers = (password) => {
  const users = [
    { id: 1, name: 'Quản trị viên hệ thống', email: 'admin@gmail.com', password, role: 'admin', status: 'active' },
    { id: 2, name: 'Nguyễn Văn An', email: 'teacher1@gmail.com', password, role: 'teacher', status: 'active' },
    { id: 3, name: 'Trần Thị Bình', email: 'teacher2@gmail.com', password, role: 'teacher', status: 'active' },
    { id: 4, name: 'Lê Hoàng Cường', email: 'teacher3@gmail.com', password, role: 'teacher', status: 'active' }
  ];

  STUDENT_NAMES.forEach((name, index) => {
    users.push({
      id: index + 5,
      name,
      email: `student${index + 1}@gmail.com`,
      password,
      role: 'student',
      status: 'active'
    });
  });

  return users;
};

const buildCourses = () =>
  COURSES.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category_id: course.category_id,
    user_id: course.user_id,
    price_course: 0,
    quiz_minutes: course.quiz_minutes,
    status: 'public'
  }));

const buildLessons = () => {
  const lessons = [];

  COURSES.forEach((course) => {
    course.lessons.forEach((title, index) => {
      lessons.push({
        id: (course.id - 1) * 5 + index + 1,
        course_id: course.id,
        title,
        content: `Nội dung bài học "${title}" của khóa "${course.title}".`,
        video_path: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
        position: index + 1
      });
    });
  });

  return lessons;
};

const buildQuestions = () => {
  const questions = [];

  COURSES.forEach((course) => {
    course.questions.forEach((question, index) => {
      questions.push({
        id: (course.id - 1) * 10 + index + 1,
        course_id: course.id,
        content: question.q,
        correct_answer: question.correct,
        false_answer: question.wrong[0],
        false_answer_2: question.wrong[1],
        false_answer_3: question.wrong[2]
      });
    });
  });

  return questions;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const bcrypt = loadBcrypt();
  const password = bcrypt ? await bcrypt.hash(PASSWORD, 10) : PASSWORD;

  if (!bcrypt) {
    console.warn('[seed] bcrypt not found, password is stored as plaintext.');
  }

  // Xóa dữ liệu cũ: bảng con trước, bảng cha sau.
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

    for (const table of tables) {
      await trx(table).del();
    }
  });

  await knex('categories').insert(CATEGORIES);
  await knex('users').insert(buildUsers(password));
  await knex('courses').insert(buildCourses());
  await knex('lessons').insert(buildLessons());
  await knex('questions').insert(buildQuestions());
  await knex('enrollments').insert(ENROLLMENTS);

  await knex('quiz_attempts').insert(
    QUIZ_ATTEMPTS.map((attempt, index) => ({
      id: index + 1,
      user_id: attempt.user_id,
      course_id: attempt.course_id,
      score: attempt.score,
      status: 'submitted',
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at
    }))
  );

  await knex('lesson_progress').insert(
    LESSON_PROGRESS.map((item, index) => ({
      id: index + 1,
      user_id: item.user_id,
      lesson_id: item.lesson_id,
      is_completed: item.is_completed
    }))
  );

  await knex('comments').insert(
    COMMENTS.map((comment, index) => ({
      id: index + 1,
      course_id: comment.course_id,
      user_id: comment.user_id,
      rating: comment.rating,
      content: comment.content
    }))
  );

  // Chèn câu hỏi gốc trước để khóa ngoại parent_id có dữ liệu tham chiếu.
  await knex('discussions').insert(DISCUSSIONS.filter((item) => item.parent_id === null));
  await knex('discussions').insert(DISCUSSIONS.filter((item) => item.parent_id !== null));
};
//AI-assisted: <Gemini> [AI-09]
