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