# Nhật ký sử dụng AI (AI Logs) - TV5

- **Thành viên:** Trần Thanh Bình (TV5)
- **Vai trò:** QA / Kiểm thử & Đảm bảo chất lượng
- **Dự án:** Hệ thống Quản lý Học tập (`3tpb-quan-ly-hoc-tap`)

---

## [AI-01] Chuẩn hóa quy trình Git Flow và Conventional Commits
- **Giai đoạn / Công việc:** Khởi tạo dự án & làm quen quy trình nhóm (N1)
- **Công cụ AI:** ChatGPT / Gemini
- **Prompt sử dụng:** Hướng dẫn quy trình tạo nhánh từ `develop`, đặt tên commit theo chuẩn Conventional Commits kèm AI trailer và cách mở Pull Request trên GitHub.
- **Kết quả AI gợi ý:** Các nhóm lệnh `git checkout -b`, cú pháp `docs:`, `feat:`, `fix:`, cách gắn trailer `AI-assisted` và quy trình gán Reviewer trên GitHub.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Điều chỉnh tên nhánh nguồn mặc định thành `develop` (không merge trực tiếp vào `main`) và gán cố định **TV2** làm Reviewer theo quy tắc review chéo của nhóm.

---

## [AI-02] Phân tích đặc tả hệ thống để xác định phạm vi kiểm thử
- **Giai đoạn / Công việc:** Lập kế hoạch kiểm thử chức năng & phi chức năng (N1)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Phân tích danh sách chức năng từ HT-01 đến HT-13 và yêu cầu phi chức năng NFR-01 đến NFR-06 để xác định các điểm rủi ro cần ưu tiên viết test case.
- **Kết quả AI gợi ý:** Bảng phân loại nhóm chức năng xác thực (`HT-03`, `HT-04`), học tập/thi trắc nghiệm (`HT-06`, `HT-11`, `HT-13`) và các tiêu chí bảo mật/cài đặt (`HT-NFR1`, `NFR-06`).
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Loại bỏ các gợi ý kiểm thử hiệu năng chịu tải lớn (JMeter/k6) và tự động hóa E2E phức tạp (Cypress/Playwright) để tập trung vào kiểm thử chức năng thủ công, API và SQL theo đúng quy mô đồ án.

---

## [AI-03] Xử lý sự cố môi trường Git, nhánh remote và cấu trúc chạy `npm`
- **Giai đoạn / Công việc:** Thiết lập môi trường local trên VS Code (N2)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Khắc phục lỗi `fatal: invalid reference` khi checkout nhánh của thành viên, xung đột file `frontend/package-lock.json` và lỗi `ENOENT: no such file or directory, open '...package.json'` ở thư mục gốc.
- **Kết quả AI gợi ý:** Hướng dẫn dùng `git fetch --all --prune`, `git restore frontend/package-lock.json` và di chuyển vào từng thư mục con `frontend/`, `backend/` trước khi chạy `npm install` / `npm run dev`.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Áp dụng trực tiếp trên Windows PowerShell của máy cá nhân, tách 2 cửa sổ Terminal riêng biệt để chạy đồng thời Backend và Frontend.

---

## [AI-04] Kiểm thử quy trình cài đặt trên thư mục sạch theo `README.md` (NFR-06)
- **Giai đoạn / Công việc:** N2-TV5-02 (Clone repo vào thư mục mới, chạy thử theo README và bổ sung bước thiếu)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Liệt kê các bước thường bị thiếu trong `README.md` khiến người mới clone dự án không chạy được ngay trong 15 phút theo tiêu chí NFR-06.
- **Kết quả AI gợi ý:** Danh sách kiểm tra gồm: bước chuyển sang nhánh `develop`, tách lệnh `cd backend` và `cd frontend`, tạo file `.env` từ `.env.example`, chạy migration/seed dữ liệu mẫu và cung cấp tài khoản đăng nhập test.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Tự thực hiện clone dự án sang thư mục độc lập (`test-readme-clean`), chạy thực tế từng lệnh để ghi nhận đúng các bước bị kẹt trên dự án của nhóm trước khi cập nhật lại `README.md`.

---

## [AI-05] Thiết lập quy trình kéo nhánh và chạy thử PR của thành viên
- **Giai đoạn / Công việc:** N2-TV5-03 (Review PR trong ngày)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Hướng dẫn quy trình pull nhánh PR của thành viên về máy local để chạy kiểm thử thực tế thay vì chỉ đọc code trên GitHub.
- **Kết quả AI gợi ý:** Các bước fetch nhánh remote, cài đặt lại dependencies, chạy server kiểm tra lỗi console/API và cách gửi `Approve` hoặc `Request changes` trên tab *Files changed*.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Bổ sung bước kiểm tra thủ tục bắt buộc của nhóm trước khi Approve: kiểm tra mô tả PR đủ 5 mục, thông báo lỗi bằng tiếng Việt và có ghi nhận `ai-logs/`.

---

## [AI-06] Khởi tạo mẫu tài liệu `docs/test-cases.md` và dữ liệu mẫu
- **Giai đoạn / Công việc:** N2-TV5-01 (`[TEST] Mẫu test case` - nhánh `docs/test-cases`)
- **Công cụ AI:** ChatGPT
- **Prompt sử dụng:** Tạo mẫu file Markdown `docs/test-cases.md` gồm bảng 6 cột (`ID`, `Mã chức năng`, `Bước`, `Dữ liệu`, `Kết quả mong đợi`, `Kết quả thực tế`) và điền 3 dòng test case mẫu.
- **Kết quả AI gợi ý:** Cấu trúc bảng Markdown 6 cột hoàn chỉnh kèm các dòng mẫu `TC-01` đến `TC-03`.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Chỉnh sửa lại mã chức năng (`HT-04`, `HT-11`, `HT-13`), dữ liệu đầu vào và trạng thái `Pending` để khớp chính xác với đặc tả của dự án `3tpb-quan-ly-hoc-tap`.

---

## [AI-07] Sinh bộ 5 Test Case cho chức năng Làm bài trắc nghiệm (`HT-06`)
- **Giai đoạn / Công việc:** N2-TV5-04 (Bổ sung test case HT-06: nộp trễ, hết lượt, bỏ trống câu)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Tạo 5 test case cho chức năng HT-06 (làm bài trắc nghiệm: nộp trễ, hết lượt, bỏ trống câu) theo bảng 6 cột.
- **Kết quả AI gợi ý:** Các kịch bản kiểm thử làm bài trắc nghiệm gồm tính điểm, quá giờ, vượt quá số lượt làm bài, bỏ trống câu hỏi và các tính năng chống gian lận mở rộng.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Loại bỏ** các gợi ý ngoài phạm vi đặc tả (câu hỏi nhiều đáp án, chấm tự luận thủ công, khóa trình duyệt/camera chống gian lận).
  - **Bổ sung** `TC-08` kiểm tra payload API không trả về đáp án đúng (`correct_answer`) xuống trình duyệt trước khi nộp bài theo đúng tiêu chí `HT-NFR1`.
  - Chuẩn hóa lại ID (`TC-04` $\rightarrow$ `TC-08`) và trạng thái `Pending` trong `docs/test-cases.md`.

---

## [AI-08] Lập checklist review bảo mật cho chức năng Đăng ký (`HT-03`)
- **Giai đoạn / Công việc:** N3-TV5-04 & N3-TV5-02 (`[TEST] Kiểm tra môi trường`)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Liệt kê các lỗi bảo mật hay gặp ở chức năng đăng ký tài khoản web để làm checklist review PR.
- **Kết quả AI gợi ý:** Danh sách 10 lỗ hổng bảo mật web phổ biến khi đăng ký (lưu mật khẩu plain-text, Mass Assignment tự gán role, SQL Injection, XSS, thiếu Rate Limiting chống spam, thiếu CAPTCHA, gửi OTP xác thực email).
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Loại bỏ** các hạng mục hạ tầng vượt phạm vi đồ án (tích hợp reCAPTCHA bên thứ 3, gửi mail OTP kích hoạt tài khoản, Redis Rate Limiting).
  - **Giữ lại và điều chỉnh 5 tiêu chí trọng tâm** khớp với kiến trúc dự án để review trực tiếp PR đăng ký:
    1. Băm mật khẩu bằng `bcrypt`/`argon2` và ẩn trường `password` trong JSON response.
    2. Chặn leo thang đặc quyền (bỏ qua `role` từ `req.body`, gán cứng mặc định `student`).
    3. Bắt trùng email ở cả tầng ứng dụng (trả lỗi `400`/`409` tiếng Việt) và ràng buộc `UNIQUE` dưới CSDL.
    4. Kiểm tra input lạ/độc hại (chuỗi toàn dấu cách, mật khẩu `< 6` hoặc `> 72` ký tự, thẻ `<script>`, sai kiểu dữ liệu Array/Object).
    5. Không trả về stack trace kỹ thuật khi phát sinh lỗi.

---

## [AI-09] Bổ sung bộ Test Case cho chức năng Đăng ký (`HT-03`)
- **Giai đoạn / Công việc:** N3-TV5-03 (`docs/test-cases.md`)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Tạo các test case cho chức năng đăng ký tài khoản HT-03 (đăng ký thành công, email trùng, mật khẩu yếu, input không hợp lệ, chống leo thang đặc quyền) theo bảng 6 cột.
- **Kết quả AI gợi ý:** 7 test case từ đăng ký chuẩn đến các trường hợp biên (bao gồm cả case quên mật khẩu và đăng nhập sai nhiều lần).
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Loại bỏ** 2 test case thuộc chức năng Đăng nhập/Quên mật khẩu để tránh trùng lặp phạm vi của `HT-03`.
  - **Chuẩn hóa** lại 5 test case (`TC-09` $\rightarrow$ `TC-13`) theo đúng cấu trúc bảng 6 cột của nhóm.
  - **Bổ sung** chi tiết kiểm tra giá trị mã hóa `bcrypt` và vai trò mặc định trong CSDL tại `TC-09`, cũng như kịch bản gửi kèm `"role": "admin"` và thẻ `<script>` tại `TC-13` để khớp với checklist bảo mật `[AI-08]`.

---

## [AI-10] Thiết kế kịch bản kiểm thử API thực tế trên Thunder Client & CSDL
- **Giai đoạn / Công việc:** N3-TV5-01 & N3-TV5-02 (Review PR Migration và PR Đăng ký)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Hướng dẫn cách dùng Thunder Client trên VS Code để gửi payload JSON test các lỗi băm mật khẩu, trùng email, role injection và input sai kiểu dữ liệu cho API đăng ký.
- **Kết quả AI gợi ý:** Các mẫu JSON request body cho phương thức `POST` kèm cách kiểm tra HTTP status code và dữ liệu CSDL.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - Điều chỉnh tên các trường JSON (`full_name`, `email`, `password`, `role`) và đường dẫn endpoint (`/api/auth/register`) cho khớp với mã nguồn thực tế của nhánh PR được review.
  - Thực thi trực tiếp toàn bộ 4 kịch bản request trên máy local, đối chiếu bảng `users` và kiểm tra ràng buộc `UNIQUE(user_id, course_id)` trên CSDL trống trước khi xác nhận trên GitHub.

  - Thực thi trực tiếp toàn bộ 4 kịch bản request trên máy local, đối chiếu bảng `users` và kiểm tra ràng buộc `UNIQUE(user_id, course_id)` trên CSDL trống trước khi xác nhận trên GitHub.  


  - Thực thi trực tiếp toàn bộ 4 kịch bản request trên máy local, đối chiếu bảng `users` và kiểm tra ràng buộc `UNIQUE(user_id, course_id)` trên CSDL trống trước khi xác nhận trên GitHub.


---

## [AI-11] Code chức năng Ghi danh và trang "Khóa học của tôi" (HT-04)
- **Giai đoạn / Công việc:** Ngày 6 – Thẻ `[HT-04]` (Ghi danh 1 lần/khóa công khai & trang Khóa học của tôi)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Nhờ AI viết giúp API ghi danh khóa học (chỉ cho ghi danh khóa công khai, chặn ghi danh trùng) và trang React "Khóa học của tôi" kèm nút bấm ở trang chi tiết khóa học.
- **Kết quả AI gợi ý:** Khung code đầy đủ từ controller, route bên Backend cho tới service gọi API, trang `MyCourses.jsx` và logic đổi trạng thái nút bấm bên Frontend.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Sửa lại tên cột & import cho khớp repo:** AI viết theo tên mặc định (`status === 'published'`, `verifyToken`, `axiosClient`), mình phải mở file `migration.sql` và các file mẫu của nhóm ra đối chiếu rồi sửa lại tên cột CSDL, tên middleware và đường dẫn import cho chạy được trên source của nhóm.
  - **Lược bỏ phần dư:** Mình bỏ qua mấy phần râu ria như tính `% tiến độ` hay làm đẹp giao diện phức tạp vì yêu cầu Ngày 6 chỉ cần ghi danh chạy được và hiện danh sách khóa đã đăng ký.
  - **Tự chạy test kiểm tra:** Ghép code xong mình tự mở Thunder Client bắn thử 2 lần liên tiếp cùng 1 khóa và thử chèn ID khóa nháp để chắc chắn backend bắt lỗi trùng (409) với chặn khóa chưa công khai (403) hoạt động chuẩn.

---
---

## [AI-12] Fix lỗi mất dữ liệu ghi danh và trắng trang "Khóa học của tôi" khi nhấn F5 (HT-04)
- **Giai đoạn / Công việc:** Thẻ `[HT-04]` – Sửa lỗi giao diện trên nhánh `feature/HT-04-ghi-danh`
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Hỏi AI cách xử lý lỗi trang "Khóa học của tôi" (`/my-courses`) bị trắng xóa và mất danh sách khóa học đã đăng ký mỗi khi nhấn F5 tải lại trang.
- **Kết quả AI gợi ý:** Gợi ý tách file `enrollmentStorage.js` để lưu đầy đủ thông tin thẻ khóa học xuống `localStorage` theo từng user, gộp dữ liệu khi gọi `getMyCourses` trong `courseService.js`, đồng thời thêm `SafeErrorBoundary.jsx` và kiểm tra mảng `Array.isArray` trước khi render ở `MyCoursesPage.jsx`.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Làm sạch dữ liệu cũ trên trình duyệt:** Lúc đầu chỉ lưu mỗi `id` khóa học nên F5 vẫn không hiện thẻ; sau khi ghép code mới mình phải xóa cache `localStorage` cũ rồi bấm ghi danh lại từ đầu để lưu đủ `title`, ảnh bìa và tên giảng viên.
  - **Tự kiểm tra thực tế trên trình duyệt:** Mở trang chi tiết bấm ghi danh, chuyển sang `/my-courses` rồi nhấn F5 nhiều lần (kể cả lúc tắt backend để test chế độ mock) để chắc chắn danh sách vẫn giữ nguyên và không bị trắng trang do lỗi `.map()`.
  - **Dọn file thừa trước khi push:** Lúc chạy lệnh kiểm tra vô tình phát sinh file `package-lock.json` ở thư mục gốc, mình tự lọc ra không commit nhầm vào nhánh `feature/HT-04-ghi-danh`.

---

## [AI-13] Xây dựng API và giao diện CRUD câu hỏi trắc nghiệm & đặt thời gian làm bài (HT-11)
- **Giai đoạn / Công việc:** Ngày 7 – Thẻ `[HT-11]` (Nhánh `feature/HT-11-cau-hoi`)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Nhờ AI viết chức năng CRUD câu hỏi trắc nghiệm (4 lựa chọn, 1 đáp án đúng), đặt thời gian làm bài (phút) cho khóa học và kiểm tra quyền chỉ giảng viên sở hữu khóa mới được sửa/xóa câu hỏi.
- **Kết quả AI gợi ý:** Bộ file tách biệt gồm `questionRepository.js`, `questionService.js`, `questionController.js`, `questionRoute.js`, unit test `questionService.test.js` và trang `TeacherQuestionsPage.jsx`.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Đồng bộ định dạng JSON với phần chấm thi (`HT-06`):** Đối chiếu `quizService.js` của TV2 để lưu `correct_answer` và mảng 3 đáp án sai dạng JSON vào cột `false_answer` của bảng `questions`, đảm bảo giảng viên tạo câu hỏi xong học viên vào làm bài và chấm điểm được ngay.
  - **Chặt chẽ kiểm tra quyền sở hữu (`HT-NFR3`):** Bổ sung hàm `assertCourseOwnership` kiểm tra `course.user_id === req.user.id` trước mọi thao tác thêm/sửa/xóa câu hỏi và đổi `quiz_duration`, viết kèm 3 unit test bằng `node:test` để xác nhận.
  - **Giữ sạch phạm vi file:** Tách toàn bộ nghiệp vụ câu hỏi sang file riêng, chỉ gắn route vào `server.js` và `App.jsx` để không xung đột với nhánh của các thành viên khác.
- **Giai đoạn / Công việc:** Ngày 7 – Thẻ `[HT-11]` (Nhánh `feature/HT-11-cau-hoi`)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Nhờ AI viết chức năng CRUD câu hỏi trắc nghiệm (4 lựa chọn, 1 đáp án đúng), đặt thời gian làm bài (phút) cho khóa học và kiểm tra quyền chỉ giảng viên sở hữu khóa mới được sửa/xóa câu hỏi.
- **Kết quả AI gợi ý:** Bộ file tách biệt gồm `questionRepository.js`, `questionService.js`, `questionController.js`, `questionRoute.js`, unit test `questionService.test.js` và trang `TeacherQuestionsPage.jsx`.
- **Phần tự lọc, chỉnh sửa & loại bỏ:**
  - **Đồng bộ định dạng JSON với phần chấm thi (`HT-06`):** Đối chiếu `quizService.js` của TV2 để lưu `correct_answer` và mảng 3 đáp án sai dạng JSON vào cột `false_answer` của bảng `questions`, đảm bảo giảng viên tạo câu hỏi xong học viên vào làm bài và chấm điểm được ngay.
  - **Chặt chẽ kiểm tra quyền sở hữu (`HT-NFR3`):** Bổ sung hàm `assertCourseOwnership` kiểm tra `course.user_id === req.user.id` trước mọi thao tác thêm/sửa/xóa câu hỏi và đổi `quiz_duration`, viết kèm 3 unit test bằng `node:test` để xác nhận.
  - **Giữ sạch phạm vi file:** Tách toàn bộ nghiệp vụ câu hỏi sang file riêng, chỉ gắn route vào `server.js` và `App.jsx` để không xung đột với nhánh của các thành viên khác.
  - **Dọn file thừa trước khi push:** Lúc chạy lệnh kiểm tra vô tình phát sinh file `package-lock.json` ở thư mục gốc, mình tự lọc ra không commit nhầm vào nhánh `feature/HT-04-ghi-danh`.

---

### [AI-14] Bổ sung tính năng % tiến độ học tập cho trang Khóa học của tôi (HT-04)
- **Thời gian:** Ngày 8
- **Công cụ:** Gemini
- **Mục tiêu:** Tính toán công thức phần trăm tiến độ học tập và hiển thị trực tiếp thanh/con số `%` lên từng thẻ khóa học tại trang "Khóa học của tôi".
- **Nội dung thực hiện:**
  - Cài đặt công thức `% tiến độ = số bài học đã hoàn thành / tổng số bài học của khóa` tại `backend/src/utils/progress.js` và tích hợp truy vấn đếm số bài hoàn thành theo từng khóa học trong `backend/src/repositories/enrollmentRepository.js`.
  - Xây dựng component thanh tiến độ `frontend/src/components/course/CourseProgress.jsx` cùng bộ hàm xử lý/lưu trữ tiến độ (`frontend/src/utils/progress.js`, `frontend/src/utils/progressStorage.js`).
  - Tích hợp hiển thị thanh tiến độ và con số `%` trực tiếp lên từng thẻ khóa học tại `frontend/src/pages/MyCoursesPage.jsx`.

  - **Dọn file thừa trước khi push:** Lúc chạy lệnh kiểm tra vô tình phát sinh file `package-lock.json` ở thư mục gốc, mình tự lọc ra không commit nhầm vào nhánh `feature/HT-04-ghi-danh`.

## [AI-15] Viết nháp Chương 7 (Kiểm thử) và Chương 8 (Quản lý mã nguồn)
- **Ngày:** 26/11/2026
- **Công cụ:** Gemini
- **Mục đích:** Tổng hợp cấu trúc báo cáo Chương 7 và Chương 8 theo mẫu quy định của giảng viên.
- **Prompt chính:** Nhiệm vụ: 1. Sửa lỗi HT-04, HT-11. 2. Chương 7 kiểm thử; chương 8 Git (thống kê commit/PR/review).
- **Kết quả & Kiểm tra:** Tạo khung 2 chương đầy đủ các đề mục 7.1–7.4 và 8.1–8.4; tự đối chiếu số liệu commit từ `git shortlog -sn --all` và chụp biểu đồ GitHub Insights để điền số liệu thật.
