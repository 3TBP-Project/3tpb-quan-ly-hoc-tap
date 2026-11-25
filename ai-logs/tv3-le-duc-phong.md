# AI log – TV3 – Lê Đức Phong

| Mục | Thông tin |
| --- | --- |
| Họ tên, MSSV | Lê Đức Phong – 0306241471 |
| Nhóm, đề tài | Nhóm 3TBP – [Quản Lý Học Tập] |
| Vai trò | TV3 – FE (Front End) |
| Công cụ AI dùng | Claude |

## Bảng tổng hợp

| Mã | Ngày | Giai đoạn | Nội dung | Commit / PR |
| --- | --- | --- | --- | --- |
| AI-01 | 10/11 | Phân tích yêu cầu | Đọc và tổng hợp tài liệu đề tài, xác định phần việc Frontend | #1 |
| AI-02 | 10/11 | Thiết kế | Thiết kế 6 Wireframe bản phác | #1 |
| AI-03 | 10/11 | Lập trình | Review và sửa component CourseCard | #2 |
| AI-04 | 10/11 | Lập trình | Dựng layout chung: App, Layout, Header, Footer | #2 |
| AI-05 | 10/11 | Tài liệu | Soạn README.md và .env.example cho frontend | #2 |
| AI-06 | 11/11 | Lập trình | Review dữ liệu giả và trang danh sách khóa học (HT-01) | #5 |
| AI-07 | 12/11 | Lập trình | Giao diện đăng ký, đăng nhập, Axios và Header theo vai trò (HT-03) | #11 |
| AI-08 | 16/11 | Lập trình | Tìm kiếm, lọc, phân trang danh sách khóa học và thành phần dùng chung (HT-01) | #24 |
| AI-09 | 17/11 | Lập trình | Trang chi tiết khóa học, ghi danh theo vai trò và trang 404 (HT-02) | #27 |
| AI-10 | 17/11 | Thiết kế | Chỉnh wireframe: tiểu mục bài học | #27 |
| AI-11 | 17/11 | Thiết kế | Chỉnh wireframe: bình luận khóa học | #27 |
| AI-12 | 17/11 | Thiết kế | Chỉnh wireframe: bỏ màn 04b | #27 |
| AI-13 | 18/11 | Lập trình | Trang học bài, đánh dấu hoàn thành và chặn khi chưa ghi danh (HT-05) | #38 |
| AI-14 | 19/11 | Lập trình | Nút xem chi tiết, làm bài kiểm tra và thông báo đăng nhập trên thẻ khóa học (HT-01) | #44 |
| AI-15 | 19/11 | Lập trình | Responsive trang học bài và trang làm bài ở 360 px ([FE] Responsive) | #48 |
| AI-16 | 25/11 | Lập trình | Code lại giao diện trang chủ theo mockup Figma "Trang chủ – thiết kế" (HT-01) | #83 |

---

### [AI-01] Đọc và tổng hợp tài liệu đề tài, xác định phần việc Frontend
- Ngày / Người dùng: 2026-11-10 / Lê Đức Phong
- Công cụ: Claude (Sonnet 5.5 - High)
- Giai đoạn: Phân tích yêu cầu
- Task / Commit / PR: HT-01, HT-02, HT-05 Đề cương / 8423d2d74fdc80c83076bd32f9a6adfff871b230 / #1
- Mục đích: Nắm yêu cầu đề tài 3 (Quản lý học tập), phân công, lịch, cách chấm và phần việc của TV3 (Frontend).
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): "Hiện tại tôi được phân công công việc là Front-End, nhóm gồm 5 thành viên, đề tài là Quản Lý Học Tập. Hãy đọc tất cả tài liệu liên quan đến Quản Lý Học tập và báo cáo tổng thể cho tôi"
- Kết quả AI trả về (tóm tắt): Báo cáo tổng hợp gồm 16 chức năng (12 bắt buộc, 4 cộng điểm), phân công TV3 = HT-01/02/05, yêu cầu phi chức năng, lịch 6 buổi, cách chấm, hiện trạng repo/ERD và các điểm cần làm rõ.
- Đánh giá: Đúng với những gì có trong tài liệu
- Đã chỉnh sửa gì: Không có
- Cách kiểm chứng: Đối chiếu danh sách chức năng bắt buộc trong đặc tả đề tài; thảo luận nhóm ở tiết 2; GV duyệt đề cương tiết 5
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 100%
- Điều học được: Thông tin về đề tài, các chức năng, công việc của Front End

### [AI-02] Thiết kế 6 Wireframe bản phác
- Ngày / Người dùng: 2026-11-10 / Lê Đức Phong
- Công cụ: Claude (Sonnet 5.5 - High)
- Giai đoạn: Thiết kế
- Task / Commit / PR: HT-01, HT-02, HT-05, DOC, FE / 8423d2d74fdc80c83076bd32f9a6adfff871b230 / #1
- Mục đích: 6 Wireframe bản phác
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
Imagine you're Front-End dev and now you want to create Wireframe for Learning Management web
Use Figwright MCP and it skill as the primary tool to design and build the website wireframe directly in my currently open Figma file.
Before starting, inspect the available Figwright MCP tools and verify that the Figma plugin is connected.
Read and understand my complete requirements below, then translate them into a structured, low-fidelity website wireframe.
Requirements:
Create 6 screen wireframes for PC views: Course List, Course Detail, Learning Page, Quiz Testing Page, Teacher Page (Course, Lesson), User Management Page.
Each Page need the following requirements:

1. Course List:
* Skin: Classic
* Columns: 4
* Courses Per Page: 8
* Hover Animation: Enable
* Show Image: Enable
* Image Size: 800x600
* Meta Data: Enable
* Rating: Enable
* Avatar: Enable
* Author: Enable
* Difficulty Level: Enable
* Category: Enable
* Wishlist: Enable
* Footer: Enable
* Pagination: Enable

2. Course Detail:
* Thumbnail
* Title
* Teacher name (contain avatar)
* Number of registered students
* Course Level and total duration
* Student Ratings
* Price or Status: Free/Register

3. Learning Page:
* Learning Interface: neat layout
* Top Navbar: left - Course name, right - Complete the Course to complete Course or change to "Retake this Course"/"Resume" if students want to retake a course or continue the Course
* Multi-media contents: Text, Image, Video (From YouTube, Facebook,...), download contents, notes and discussion/Q&A
* Evaluation and testing
* Student Dashboard: Contain Student information, courses, lessons, progress, certification,...

4. Quiz Testing Page:
* Header: Close button/Quit Quiz return to Course, Quiz Title, Quiz Timer
* Main: Progress Bar, Question Card: number order, score of this question, Question Content (Text, Image or recipe Math LaTeX), Answer Options (Single Quiz, Multiple Quiz, True/False, Fill the blanks, drag/drop match
* Navigation Footer: Previous Button (Can hide if teacher configure it hide), Next Button or Submit Quiz Button in last question
* Question Pagination

5. Teacher Page (Course, Lesson):
* Header: Toolbar (Find Course, Notification and avatar teacher), Setting, Light/Dark button
* Sidebar: Dashboard, Courses, Lessons, Quiz Attempts, Earnings
* Overview Cards
* Recent Courses List: Thumbnail, Course name, Status (Published / Draft) and action buttons (Edit, Delete, Add, Duplicate)

6. User Management Page:
* Header: Page Title (can contain current user number), Main action button (Add user or export csv/excel)
* Role Tabs: All Users, Students, Instructors, Pending Instructors
* Search & Filter: Search Bar, Course Filter, Lesson Filter, Status Filter
* User Data Table: Checkbox - bulk operations (Delete, change status, send email), Avatar & Name (Avatar + Full Name + Email), Role - Badge/Student color discrimination with Instructor, Enrolled/Teaching Course, Status, Actions (Edit, View Profile, Approve, Delete/Block)
* Pagination

Note:
Simplify the interface based on ERD (D:\nopbai\HocKy6\DoAnWeb\ERD)
Change all text to Vietnamese language.
Change resolution of wireframe to rectangle (like 1280x720)
Make all Header, Content, Footer, Button, Text, Format synchronize
Delete all section 01 - Course List, 02 - Course Detail inside Wireframe
Divide the interface into multiple blocks based on functionality to improve visual clarity
Works well on phones
Execution instructions:

* Work directly in Figma through Figwright MCP, not by generating HTML/CSS or code as a substitute.
* Create the wireframe directly on the currently open Figma page.
* Organize pages, frames, sections, and components logically.
* Use Auto Layout wherever appropriate.
* Establish a consistent spacing system and layout hierarchy.
* Include all required pages, navigation, content sections, forms, buttons, and interactions described in my requirements.
* Use reusable components where appropriate.
* Prioritize structure, usability, information architecture, and responsive layout.
* Use low-fidelity grayscale styling. Avoid unnecessary visual decoration.
* Do not omit, simplify, or invent features that conflict with my requirements.
Before making changes, explain your proposed wireframe structure briefly. Then execute the design in Figma.

After completion, verify the created frames and report any incomplete requirements or limitations.
- Kết quả AI trả về (tóm tắt): 6 Wireframe bản phác
- Đánh giá: Thiếu chức năng lọc theo giảng viên, danh sách bài học – Thiếu yêu cầu trong Prompt
- Đã chỉnh sửa gì: Thêm nút lọc theo giảng viên, danh sách bài học
- Cách kiểm chứng: Đối chiếu 6 Wireframe so với Yêu cầu chức năng
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 100%
- Điều học được: Thiết kế giao diện

### [AI-03] Review và sửa component CourseCard
- Ngày / Người dùng: 2026-11-10 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [FE] Layout chung, HT-01 / 035e651d4d38ad70bbb01a5d263ee8744b50a1e2 / #2
- Mục đích: Kiểm tra thẻ khóa học (ảnh bìa, tên, giảng viên, số bài) có đúng yêu cầu và chạy được.
- Prompt chính: "…\CourseCard.jsx Xem thử nội dung đúng yêu cầu không", sau đó "Áp dụng bản sửa"
- Kết quả AI trả về (tóm tắt): Chỉ ra thiếu `export default`, dùng `styled-components` chưa cài, import thừa, thẻ không bấm được, ảnh làm thẻ lệch chiều cao; viết lại bằng `react-bootstrap` và đổi tên trường thành `title`, `teacherName`, `lessonCount`.
- Đánh giá: Đúng, các lỗi kiểm tra được bằng đọc `package.json` và `npm run lint`. Tên trường AI đề xuất cần được thống nhất với API của TV2.
- Đã chỉnh sửa gì: Thêm `export default`, cài `styled-components`, xóa các import thừa, sửa thẻ có thể bấm được
- Cách kiểm chứng: `npm run lint` không lỗi; đối chiếu `package.json` (không có `styled-components`); [chạy `npm run dev` nếu đã làm].
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 75%
- Điều học được: Thiết kế thẻ khóa học đúng với yêu cầu

### [AI-04] Dựng layout chung (App, Layout, Header, Footer)
- Ngày / Người dùng: 2026-11-10 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [FE] Layout chung / f991cd2b8471b8a0b6adc12f13ad46050f2a6104 / #2
- Mục đích: Dựng khung giao diện chung, menu theo vai trò, responsive, theo hướng dẫn Ngày 2.
- Prompt chính: "Phần layout chung tôi nên làm vào đâu?"; "Kiểm tra App.jsx và Layout.jsx đã ổn? Header/Footer.jsx nên làm gì"; "Sửa giúp tôi"
- Kết quả AI trả về (tóm tắt): Chỉ ra thiếu import, thiếu `BrowserRouter`, Header/Footer rỗng, CSS mẫu của Vite (`#root` rộng 1126px, canh giữa chữ) phá layout; sửa `main.jsx`, `App.jsx`, `Layout.jsx`, `index.css`, viết `Header.jsx`, `Footer.jsx`, trang tạm `CourseListPage.jsx`, xóa `App.css`.
- Đánh giá: Đúng một phần: lint và build thành công, nhưng menu dùng vai trò giả và các liên kết chưa có trang đích.
- Đã chỉnh sửa gì: Sửa main.jsx, App.jsx và index.jsx
- Cách kiểm chứng: `npm run lint`, `npm run build`; chạy thử 4 vai trò và kiểm tra 360 px / 1366 px.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 85%
- Điều học được: Cách thiết kế giao diện dùng chung

### [AI-05] Soạn README.md và .env.example cho frontend
- Ngày / Người dùng: 2026-11-10 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Tài liệu
- Task / Commit / PR: [FE] Layout chung / c039b9d3c4226d361d061359f9b59fea747a3118 / #2
- Mục đích: Thay README mẫu của Vite bằng hướng dẫn cài đặt, chạy, biến môi trường (yêu cầu NFR-02, NFR-06).
- Prompt chính: "Hãy viết giúp tôi file README.md và .env.example"
- Kết quả AI trả về (tóm tắt): README (công nghệ, cài đặt, lệnh, cấu trúc, hiện trạng, quy ước) và `.env.example` với `VITE_API_URL`.
- Đánh giá: Thiếu một phần: `VITE_API_URL=http://localhost:3000/api` là giá trị giả định, yêu cầu Node 20.19+ do AI suy từ phiên bản Vite, cả hai chưa kiểm chứng với TV2 và môi trường thật.
- Đã chỉnh sửa gì: Không có
- Cách kiểm chứng: [ví dụ đã chạy lại các lệnh trong README; đã hỏi TV2 cổng backend]
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 100%
- Điều học được: Cách tình bày README, khai báo `.env.example` mà không làm lộ dữ liệu nhạy cảm

### [AI-06] Review dữ liệu giả và trang danh sách khóa học (HT-01)
- Ngày / Người dùng: 2026-11-11 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-01] / 1dfae2b95b44c96f8f44eb88475cd1cf0e020947 / #5
- Mục đích: Kiểm tra dữ liệu giả và trang danh sách khóa học trước khi mở PR; nắm cách xếp CourseCard bằng Row và Col.
- Prompt chính: "Kiểm tra file mock data nằm ở mocks xem tôi đã thực hiện đúng chưa, có cần phải sửa chỗ nào không?"; "CourseListPage xếp CourseCard bằng Row và Col ra sao"; "Kiểm tra lại lần cuối phần làm việc hiện tại của tôi đã sẵn sàng để tạo PR?"
- Kết quả AI trả về (tóm tắt): Chỉ ra tệp mock đầu tiên là component chứ không phải dữ liệu, import sai đường dẫn, tên thuộc tính `img` không khớp `coverImage`, thiếu `id`; gợi ý mảng `mockCourses` (8 khóa, 3 giảng viên có `teacherId`, ảnh `/images/...`) và ví dụ `Row`/`Col` chia cột theo màn hình. Lần kiểm tra cuối phát hiện `CourseListPage.jsx` có `return` xuống dòng, import sai đường dẫn, dấu `;` thừa; lint 3 lỗi, build thất bại.
- Đánh giá: Đúng, các lỗi tái hiện được bằng `npm run lint` và `vite build`.
- Đã chỉnh sửa gì: Tự viết lại `mocks/course.js` theo góp ý (thêm `teacherId`, còn 3 giảng viên, ảnh mặc định `/images/course-default.jpg`); sửa lỗi sau return không có dấu ().
- Cách kiểm chứng: `npm run lint`, `npm run build`; chạy `npm run dev`, kiểm tra 1 cột ở 360 px và 3 cột ở 1366 px.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 10%
- Điều học được: Thiết kế mock data, cách sắp xếp Row và Col và đưa dữ liệu giả vào `CourseListPage.jsx`

### [AI-07] Giao diện đăng ký, đăng nhập, Axios và Header theo vai trò (HT-03)
- Ngày / Người dùng: 2026-11-12 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-03] / 83e5cdeece0dc3e17fafcdf87a83181bb02868c6 / #11
- Mục đích: Viết mã giao diện đăng ký, đăng nhập, gọi API bằng Axios và Header theo vai trò.
- Prompt chính: "Gợi ý nội dung các file cho hôm nay"; "Kiểm tra tiến trình code hiện tại của tôi, có thiếu sót nào không"; "Sửa giúp tôi"
- Kết quả AI trả về (tóm tắt): Mã gợi ý cho `axiosClient`, `authService`, `AuthContext`, `authSchema`, `InputField`, `LoginPage`, `RegisterPage`, `ProtectedRoute`, `Header` (React Hook Form + Yup, Axios interceptor, Context API). Sau khi kiểm tra mã đã gõ, AI chỉ ra 9 lỗi lint (sai thư mục và đường dẫn import, thiếu `context/`, dùng `process.env` thay vì `import.meta.env`, khóa token không khớp, `RegisterPage` chưa hoàn chỉnh) và sửa trực tiếp.
- Đánh giá: Đúng một phần: gợi ý đầu của AI dùng `useState` và `services/api.js`, phải đổi sang React Hook Form + Yup và `api/axiosClient.js`; các lỗi còn lại tái hiện được bằng `npm run lint`.
- Đã chỉnh sửa gì: Gõ lại mã theo gợi ý; chuyển `InputField`, `ProtectedRoute` về `components/auth/`, thêm `context/` và `utils/roles.js`, sửa `axiosClient.js`, viết đủ `RegisterPage.jsx`, nối `App.jsx`, `main.jsx`, `Header.jsx`; bỏ route giảng viên vì trang chưa có.
- Cách kiểm chứng: `npm run lint` (0 lỗi), `npm run build` thành công.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 90%
- Điều học được: Vite dùng `import.meta.env.VITE_*`, không dùng `process.env` như Create React App; khóa token phải thống nhất giữa nơi lưu và interceptor.

### [AI-08] Tìm kiếm, lọc, phân trang danh sách khóa học và thành phần dùng chung (HT-01)
- Ngày / Người dùng: 2026-11-16 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-01] / 049889d0782d35e80647161487090fe78f524f57 -> 937d47b071c6cfaf32b7128069841275154c0108 / #24
- Mục đích: Làm bộ lọc tìm kiếm, lọc danh mục và giảng viên, phân trang phía server cho danh sách khóa học theo wireframe màn 01, và tách các thành phần dùng chung cho nhiều màn hình.
- Prompt chính: "Kiểm tra file CourseFilter.jsx của tôi đã đủ với yêu cầu về chức năng chưa, sau đó hãy thiết kế lại giao diện cho đúng với Wireframe đã được thiết kế và thêm vào giao diện chính, và sửa các phần dùng chung sao cho có thể sử dụng ở mọi màn hình"
- Kết quả AI trả về (tóm tắt): Chỉ ra `CourseFilter.jsx` ban đầu là ví dụ tìm kiếm chung, lọc ở trình duyệt. Viết lại theo wireframe. Thêm `components/common` gồm Pagination, PageHeader, Loading, ErrorMessage, EmptyState, `hooks/useFetch.js`, `services/courseService.js` kèm dữ liệu giả `mocks/courseApi.js`, sửa `CourseCard.jsx`, ghép vào `CourseListPage.jsx`.
- Đánh giá: Đúng một phần: bộ lọc ban đầu không chạy được nên được viết lại; AI đề xuất dùng dữ liệu giả làm mặc định tạm thời vì backend chưa có `/api/courses`.
- Đã chỉnh sửa gì: Chia thành 4 commit nhỏ theo từng phần; giữ dữ liệu giả ở chế độ tạm thời để thử giao diện.
- Cách kiểm chứng: `npm run lint` (0 lỗi), `npm run build` thành công; kiểm tra trên trình duyệt với dữ liệu giả (tìm kiếm, lọc, đổi trang, kết quả rỗng, xóa bộ lọc, 4 cột ở 1366 px, 1 cột ở 375 px).
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 70%
- Điều học được: Lọc và phân trang phải làm ở server, bộ lọc chỉ báo giá trị cho trang cha, hook gọi API cần cleanup để kết quả cũ không ghi đè kết quả mới, đổi bộ lọc phải đưa về trang 1.

### [AI-09] Trang chi tiết khóa học, ghi danh theo vai trò và trang 404 (HT-02)
- Ngày / Người dùng: 2026-11-17 / Lê Đức Phong
- Công cụ: Claude Code (Sonnet 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-02] / 4ebed0a126d4369db0e112793e87c5c599c2280c / #27
- Mục đích: Làm trang chi tiết khóa học `/courses/:id` theo wireframe màn 02 (mô tả, giảng viên, danh sách tiêu đề bài học, số học viên), nút ghi danh theo vai trò và trang 404, dùng dữ liệu giả cho tới khi backend có API.
- Prompt chính: "Gợi ý những file và code ch công việc của ngày hôm nay, tham khảo từ tài liệu mà giảng viên đã đưa ra"; "Kiểm tra các file hiện tại còn thiếu sót hoặc sai không"
- Kết quả AI trả về (tóm tắt): Gợi ý `CourseDetailPage`, `LessonList`, `EnrollButton`, `StatusPage`, `NotFoundPage`, `mocks/courseDetailApi.js`, hai hàm `getCourseById` và `enrollCourse` trong `courseService.js`, route `/courses/:id` và `*`.
- Đánh giá: Đúng một phần: `useFetch.js` phải sửa lại để trả thêm `status` phân biệt lỗi 404; khối ảnh và nút ghi danh nằm dưới danh sách bài học trên màn hình hẹp.
- Đã chỉnh sửa gì: Sửa lại `useFetch.js` (thêm `status`, đặt lại `return`), bổ sung import trong `courseService.js` và `App.jsx`, đổi `NotFound.jsx` thành `NotFoundPage.jsx` có tên hàm, thêm hai mã AI vào đầu `useFetch.js`; giữ `VITE_USE_MOCK` làm chế độ tạm thời.
- Cách kiểm chứng: `npm run lint` (0 lỗi), `npm run build` thành công; kiểm tra trên trình duyệt với dữ liệu giả: khách thấy "Đăng nhập để ghi danh", học viên bấm "Ghi danh" thì chuyển thành "Vào học" và số học viên tăng 1, giảng viên không có nút ghi danh, `/courses/999` ra trang 404, 360 px không tràn ngang.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 85%
- Điều học được: `useParams` lấy tham số động từ URL, route `*` bắt đường dẫn không tồn tại, `useFetch` cần trả mã trạng thái để phân biệt 404 với lỗi khác, và khối `return` đặt sai chỗ trong `useEffect` làm mất cleanup.

### [AI-10] Chỉnh wireframe: tiểu mục bài học
- Ngày / Người dùng: 2026-11-17 / Lê Đức Phong
- Công cụ: Claude Code + Figwright MCP (Sonnet 5.5 - High)
- Giai đoạn: Thiết kế
- Task / Commit / PR: [HT-02] / 96a778146e72ca6ba7da1c6ca7a0a5f11901f605 / #27
- Mục đích: Cập nhật wireframe cho khớp trang chi tiết khóa học và trang học: thêm tiểu mục nội dung bài, thêm mục bình luận, bỏ các thành phần và màn không còn dùng.
- Prompt chính (nguyên văn): Check connect Figwright first, and then, changes these wireframe with the following requirements:
In 03 - Trang học, add more tab subsections of the course content, like:
Bài 1: Giới thiệu Python has subsections like 1. Lý thuyết, 2. Nội dung, 3. Ý nghĩa, 4. Ví dụ,...
- Kết quả AI trả về (tóm tắt): Kiểm tra kết nối Figwright, sửa 03 – Trang học (tiểu mục 1. Lý thuyết đến 6. Tóm tắt dưới mỗi bài ở cột trái và dạng tab ở nội dung).
- Đánh giá: Đã thêm các phần còn thiếu, chốt với thành viên 4
- Đã chỉnh sửa gì: Không có
- Cách kiểm chứng: Xuất lại PNG từ Figma và đối chiếu từng màn trong `docs/wireframes/`.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 100%
- Điều học được: Thiết kế giao diện

### [AI-11] Chỉnh wireframe: bình luận khóa học
- Ngày / Người dùng: 2026-11-17 / Lê Đức Phong
- Công cụ: Claude Code + Figwright MCP (Sonnet 5.5 - High)
- Giai đoạn: Thiết kế
- Task / Commit / PR: [HT-02] / 96a778146e72ca6ba7da1c6ca7a0a5f11901f605 / #27
- Mục đích: Cập nhật wireframe cho khớp trang chi tiết khóa học và trang học: thêm tiểu mục nội dung bài, thêm mục bình luận, bỏ các thành phần và màn không còn dùng.
- Prompt chính (nguyên văn): Check Figwright connection. Add section Comments in 02 - Chi tiết khóa học contains number Comment and when click, it view all comments in Course Detail. For Mobile too with 03 - Trang học and 02 - Chi tiết khóa học
- Kết quả AI trả về (tóm tắt): Thêm mục bình luận kèm số lượng ở 02 – Chi tiết khóa học, thêm màn mới 02b – Tất cả bình luận, cập nhật bản di động M02 và M03.
- Đánh giá: Đã thêm các phần còn thiếu, chốt với thành viên 4
- Đã chỉnh sửa gì: Không có
- Cách kiểm chứng: Xuất lại PNG từ Figma và đối chiếu từng màn trong `docs/wireframes/`.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 100%
- Điều học được: Thiết kế giao diện

### [AI-12] Chỉnh wireframe: bỏ màn 04b
- Ngày / Người dùng: 2026-11-17 / Lê Đức Phong
- Công cụ: Claude Code + Figwright MCP (Sonnet 5.5 - High)
- Giai đoạn: Thiết kế
- Task / Commit / PR: [HT-02] / 96a778146e72ca6ba7da1c6ca7a0a5f11901f605 / #27
- Mục đích: Cập nhật wireframe cho khớp trang chi tiết khóa học và trang học: thêm tiểu mục nội dung bài, thêm mục bình luận, bỏ các thành phần và màn không còn dùng.
- Prompt chính (nguyên văn): Delete Image in Hàng ảnh + Văn bản in 03 - Trang học, and delete all 04b
- Kết quả AI trả về (tóm tắt): Thêm mục bình luận kèm số lượng ở 02 – Chi tiết khóa học, thêm màn mới 02b – Tất cả bình luận, cập nhật bản di động M02 và M03.
- Đánh giá: Đã thêm các phần còn thiếu, chốt với thành viên 4
- Đã chỉnh sửa gì: Không có
- Cách kiểm chứng: Xuất lại PNG từ Figma và đối chiếu từng màn trong `docs/wireframes/`.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 100%
- Điều học được: Thiết kế giao diện

### [AI-13] Trang học bài, đánh dấu hoàn thành và chặn khi chưa ghi danh (HT-05)
- Ngày / Người dùng: 2026-11-18 / Lê Đức Phong
- Công cụ: Claude Code (Opus 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-05] / 8f43159aeec9065d03a9653fe3150c326b202b35 / #38
- Mục đích: Làm trang học bài `/courses/:id/learn/:lessonId` theo wireframe màn 03 và M03: danh sách bài bên trái, nội dung bên phải, video nhúng, liên kết tải PDF, bài trước/sau, nút "Đánh dấu hoàn thành", chưa ghi danh thì không vào được (HT-NFR2); dùng dữ liệu giả cho tới khi backend có API bài học và tiến độ.
- Prompt chính: "Gợi ý file và code hôm nay, các tài liệu tham khảo, các tài liệu giảng viên đã cho nằm ở đâu trong các bài lab"; "Kiểm tra tiến trình hiện tại"; "Sửa giúp tôi"
- Kết quả AI trả về (tóm tắt): 
+ Đối chiếu Lab 4, 5, 8, 13, 14, 15, gợi ý `LearnPage`, `LessonSidebar` (dùng `NavLink`), `LessonContent` (khung video 16:9), `LessonNav`, `utils/video.js` (chỉ nhận link YouTube/Facebook), `services/lessonService.js`, `mocks/lessonApi.js`, hai route có `ProtectedRoute` và thông báo ở trang chi tiết khi bị chặn.
+ Gợi ý cách kiểm tra quyền ở server: middleware kiểm tra `enrollments` hoặc giảng viên sở hữu rồi trả 403, ghi tiến độ bằng `INSERT ... ON DUPLICATE KEY UPDATE` để không trùng.
+ Sau khi kiểm tra mã đã gõ, AI chỉ ra 9 lỗi lint và sửa trực tiếp.
- Đánh giá: Đúng một phần: mã gõ lại có lỗi (thiếu import trong `App.jsx`, sai tên `mockCourse` và `mockGetLessonById`, biến `lesson` không tồn tại, hàm `fail` luôn trả 404 nên không kiểm tra được HT-NFR2, `mockCompleteLesson` nhận sai tham số); `lessonService` đọc `VITE_USE_MOCK` ngược với `courseService` nên trang học gọi backend thật trong khi trang chi tiết dùng dữ liệu giả. Wireframe có tab tiểu mục nhưng bảng `lessons` chỉ có một cột `content`, cần chốt với TV4.
- Đã chỉnh sửa gì: Sửa các lỗi trên; trang chi tiết và trang học dùng chung `buildLessons` để cùng một danh sách bài; gộp import `useLocation`; thay link video mẫu bằng hằng `SAMPLE_VIDEO`; đường dẫn API `/api/courses/:id/learn` và `/api/lessons/:id/complete` để tạm, chờ chốt với TV4 và TV5.
- Cách kiểm chứng: `npm run lint` (0 lỗi), `npm run build` thành công; kiểm tra trên trình duyệt với dữ liệu giả: khách mở trang học bị chuyển sang `/login`; học viên chưa ghi danh bị đưa về trang chi tiết kèm thông báo "Bạn cần ghi danh để vào học."; ghi danh rồi bấm "Vào học" vào bài 1; "Đánh dấu hoàn thành" làm tiến độ tăng 0/10 lên 1/10 và nút bị tắt; "Bài sau" chuyển bài và tô đúng bài ở cột trái; bài hoặc khóa không tồn tại ra trang 404; 360 px không tràn ngang.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 85%
- Điều học được: Kiểm tra quyền xem bài phải làm ở server, giao diện chỉ ẩn nút; `NavLink` tự gắn class `active` cho bài đang học; route có hai tham số `:id` và `:lessonId`; cờ dữ liệu giả phải thống nhất giữa các service; thẻ `<a href>` không gửi token nên tải tệp có kiểm tra quyền phải tải qua Axios.

### [AI-14] Nút xem chi tiết, làm bài kiểm tra và thông báo đăng nhập trên thẻ khóa học (HT-01)
- Ngày / Người dùng: 2026-11-19 / Lê Đức Phong
- Công cụ: Claude Code (Opus 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-01] / 1ed577712863a45ad5080d9142a7f7e5f507e23b / #44
- Mục đích: Sửa lỗi sau khi merge PR #41: bấm vào thẻ khóa học thì vào trang làm bài kiểm tra thay vì trang chi tiết; tách thành hai nút riêng "Xem chi tiết" và "Làm bài kiểm tra"; khách chưa đăng nhập bấm vào thẻ thì hiện thông báo đăng nhập.
- Prompt chính (nguyên văn): "Kiểm tra nhánh develop hiện tại, ở PR#38 và #41 có xung đột gì trong lúc merge khiến khi nhấn vào khóa học thì không vào chi tiết khóa học mà lại vào phần làm bài kiểm tra hay không"; "Ở CourseListPage, hãy thêm 1 nút xem chi tiết khác biệt với nút Làm bài kiểm tra"; "Hãy thêm thông báo khi khách vãng lai chưa đăng nhập mà nhấn nút "Xem khóa học" khi trỏ chuột vào khóa học sẽ hiển thị thông báo vui lòng đăng nhập"; "Thông báo nhìn không hợp với giao diện web hiện tại"
- Kết quả AI trả về (tóm tắt):
+ Đối chiếu lịch sử `develop`: không phải xung đột merge, commit `3280c8a` (HT-06) đổi link thẻ trong `CourseListPage.jsx` sang `/courses/:id/quiz`; `App.jsx` sau merge vẫn đủ route.
+ Trả link thẻ về trang chi tiết, thêm hai nút `Button as={Link}` "Xem chi tiết" và "Làm bài kiểm tra" qua `children` của `CourseCard`.
+ Thêm prop `onClick` cho `CourseCard`; với khách thì chặn chuyển trang (`preventDefault`) và mở thông báo có nút "Đăng nhập" kèm `state.from` để đăng nhập xong quay lại đúng khóa học.
- Đánh giá: Bản đầu dùng `Toast` nền vàng, không hợp giao diện nên đổi sang `Modal` trắng ở giữa màn hình. Nút "Xem chi tiết" và "Làm bài kiểm tra" chưa chặn khách nên chưa đồng nhất với bấm vào thẻ
- Đã chỉnh sửa gì: Thay `Toast` bằng `Modal` (nút "Để sau" và "Đăng nhập"); giữ prop `actionLabel` TV2 đã thêm vào `CourseCard`; thêm mã AI vào đầu `CourseListPage.jsx`.
- Cách kiểm chứng: `npm run lint` (0 lỗi), `npm run build` thành công; kiểm tra trên trình duyệt với dữ liệu giả: 8 thẻ đều có hai nút đúng đường dẫn `/courses/:id` và `/courses/:id/quiz`; khách bấm vào thẻ thì ở lại trang và hiện thông báo; bấm "Đăng nhập" chuyển sang `/login` mang theo `/courses/1`; học viên đã đăng nhập bấm vào thẻ thì vào `/courses/1`; 360 px hai nút cùng một hàng, không tràn ngang.
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 90%
- Điều học được: Lỗi sau merge không phải lúc nào cũng do xung đột, cần xem `git diff` từng commit để tìm ai đổi gì

### [AI-15] Responsive trang học bài và trang làm bài ở 360 px ([FE] Responsive)
- Ngày / Người dùng: 2026-11-19 / Lê Đức Phong
- Công cụ: Claude Code (Opus 5.5 - High)
- Giai đoạn: Lập trình
- Task / Commit / PR: [FE] Responsive / db8570c360c581623da4faeaaece701f6493f594 / #48
- Mục đích: Rà trang học bài và trang làm bài ở 360 px theo hướng dẫn Ngày 9 (video co giãn, câu hỏi dễ chọn) và sửa lỗi hiển thị.
- Prompt chính (nguyên văn): "Gợi ý tài liệu tham khảo, nguồn từ các bài lab của giảng viên, file và code cho hôm nay"
- Kết quả AI trả về (tóm tắt):
+ Các bài lab không có bài riêng về responsive; dùng lab10 Phần 3 (Flexbox, Box Model), lab09 Phần 2 (CSS theo component), lab04 (`useState` bật/tắt), lab05 (render theo điều kiện).
+ `LessonNav`: dùng `Row`/`Col` để nút "Đánh dấu hoàn thành" rộng cả hàng trên điện thoại, "Bài trước / Bài sau" chia đôi bên dưới (theo M03); thêm lớp `w-md-auto` vào `index.css`.
+ `LearnPage`: tên khóa dài xuống dòng (`text-break`), thanh tiến độ rộng hết hàng trên điện thoại.
+ `LessonSidebar`: nút "Nội dung khóa học (x/y)" thu gọn mục lục trên điện thoại.
+ `QuizPage.css` (của TV2): `scroll-margin-top` để câu hỏi không bị thanh dính che, rút gọn tiêu đề, radio to hơn, 10 ô số câu trên một hàng ở màn ≤ 420 px.
- Đánh giá: Video đã co giãn sẵn nhờ `Ratio 16x9`; trang làm bài của TV2 đã có `@media` và dòng đáp án cao 44 px nên chỉ cần sửa nhỏ. Mã gõ lại có lỗi: `useState` đặt ngoài hàm `LessonSidebar` (ESLint `rules-of-hooks`, trang học bị lỗi khi chạy); tiêu đề "Nội dung khóa học" hiện trùng với nút trên điện thoại; nút "Đánh dấu hoàn thành" thiếu `w-100`; khối `@media (max-width: 420px)` trong `QuizPage.css` bị xóa mất 2 luật cũ của TV2 (`.quiz-result__metrics`, `.quiz-intro-card`). Trang làm bài cần backend chạy mới thử được.
- Đã chỉnh sửa gì: Đưa `useState` vào trong hàm, thêm `d-none d-lg-block` cho tiêu đề, thêm `w-100` cho nút hoàn thành, trả lại 2 luật CSS cũ của TV2
- Cách kiểm chứng: `npm run lint` 0 lỗi, `npm run build`; Chrome DevTools 360 × 740: không tràn ngang, nút bài học và mục lục, trang làm bài với backend thật
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): 80%
- Điều học được: Bootstrap có `order-*` và `d-*-none` để đổi vị trí, ẩn hiện theo kích thước màn hình; hook chỉ được gọi bên trong component

### [AI-16] Code lại giao diện trang chủ theo mockup Figma "Trang chủ – thiết kế" (HT-01)
- Ngày / Người dùng: 2026-11-25 / Lê Đức Phong
- Công cụ: Claude Code (Opus 5.5) + Figwright MCP
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-01] Danh sách khóa học / f474f78bcfbad74c89f3a9f891d6511989af4c1b / #83
- Mục đích: Đưa mockup "Trang chủ · Desktop/Mobile · Sáng/Tối" và các trạng thái (đang tải, trống, lỗi, cần đăng nhập) từ Figma vào code trên nhánh `feature/HT-01-giao-dien-trang-chu`.
- Prompt chính (nguyên văn): "Bây giờ tôi muốn thiết kế lại giao diện (code) của trang chủ dựa theo Mockup Trang chủ - thiết kế trên nhánh develop"
- Kết quả AI trả về (tóm tắt):
+ `styles/theme.css`: biến màu sáng/tối, màu từng danh mục, bo góc, chữ (Baloo 2, Be Vietnam Pro) lấy từ biến Figma; nút `ht-btn` (primary / secondary / ghost); khung nội dung 1206 px.
+ `utils/theme.js` + nút đổi giao diện sáng/tối trên Header (lưu localStorage, đồng bộ `data-bs-theme` của Bootstrap).
+ `Header`, `Footer`, `Logo` mới (ảnh logo nhóm 3TBP `assets/logo.png` + tên "Học Vui"); menu ☰ trên điện thoại.
+ `CourseCard`: ảnh bìa minh họa theo màu danh mục (khi chưa có ảnh riêng), nhãn danh mục, chữ viết tắt giảng viên, hover nhấc 4 px; `utils/categoryTheme.js` chọn màu và sticker theo tên danh mục.
+ `CourseFilter` có nhãn "Danh mục", "Giảng viên"; `Pagination` mới (điện thoại hiện "Trang x / y").
+ `CourseListPage`: khối giới thiệu, lưới 3 cột, khung chờ tải, trạng thái trống / lỗi có nút "Thử lại", modal "Cần đăng nhập" theo Figma.
- Đánh giá: Đúng bố cục Figma (đo bằng trình duyệt: khung 1206 px, thẻ 386 × 426 px ở 1366 px; 328 × 482 px ở 360 px; không tràn ngang). Lệch có chủ ý: bỏ ô tìm kiếm trên Header (trùng với ô tìm trong bộ lọc), thêm nút đổi sáng/tối (Figma chưa vẽ). Trang khác (đăng nhập, quản trị…) vẫn giao diện Bootstrap cũ, chỉ đổi font, màu nền, Header/Footer.
- Đã chỉnh sửa gì: Không có
- Cách kiểm chứng: `npm run lint` (không lỗi mới; 5 lỗi có sẵn ở useFetch, MyCoursesPage, TeacherLessonsPage, TeacherQuestionsPage), `npm run build`; chạy `npm run dev` với dữ liệu giả: 1366 px và 360 px, sáng/tối, mở menu ☰, khách bấm "Làm bài kiểm tra" hiện modal.
- Tỷ lệ mã AI còn giữ lại (ước lượng): <bạn tự ước lượng>%
- Điều học được: Đọc biến Figma thành biến CSS để đổi sáng/tối chỉ bằng 1 thuộc tính `data-theme`; dùng `stretched-link` + `z-index` để cả thẻ bấm được mà nút bên trong vẫn hoạt động.

<!-- Mẫu mục mới: chép khối dưới, đổi mã AI-xx

### [AI-xx] Tiêu đề ngắn
- Ngày / Người dùng:
- Công cụ:
- Giai đoạn: Phân tích yêu cầu | Lập kế hoạch | Thiết kế | Lập trình | Kiểm thử | Tài liệu
- Task / Commit / PR:
- Mục đích:
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
- Kết quả AI trả về (tóm tắt):
- Đánh giá: Đúng / Sai / Thiếu – vì sao
- Đã chỉnh sửa gì:
- Cách kiểm chứng:
- Tỷ lệ mã AI còn giữ lại (ước lượng): ...%
- Điều học được:
-->
