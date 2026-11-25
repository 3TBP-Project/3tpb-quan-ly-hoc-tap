# CHƯƠNG 7. KIỂM THỬ

## 7.1. Kế hoạch kiểm thử
Hoạt động kiểm thử được thực hiện xuyên suốt quá trình phát triển nhằm đảm bảo hệ thống **Website Quản lý học tập trực tuyến** đáp ứng đầy đủ 12 chức năng bắt buộc (`HT-01` → `HT-07`, `HT-09` → `HT-11`, `HT-14`, `HT-15`), chức năng mở rộng (`HT-13`) cùng các yêu cầu phi chức năng về bảo mật và cài đặt (`HT-NFR1` → `HT-NFR4`, `NFR-06`).

Kế hoạch kiểm thử chia thành 3 cấp độ:
1. **Kiểm thử đơn vị (Unit Test):** Kiểm tra độc lập các hàm nghiệp vụ cốt lõi ở tầng `Service` và `Repository` của Backend bằng công cụ tích hợp sẵn `node --test` (không phụ thuộc CSDL thật nhờ kỹ thuật stub/mock).
2. **Kiểm thử API và Bảo mật:** Sử dụng Thunder Client / Postman và DevTools (`F12`) để kiểm thử các kịch bản biên: kiểm tra xác thực JWT, phân quyền 3 vai trò (`student`, `teacher`, `admin`), chống leo thang đặc quyền khi đăng ký, chặn truy cập nội dung bài học khi chưa ghi danh, và kiểm tra tính toàn vẹn của bài thi trắc nghiệm (không lộ trường `correct_answer`, từ chối bài nộp quá thời gian).
3. **Kiểm thử giao diện và kiểm thử chéo (Cross-testing):** Kiểm tra luồng thao tác thực tế trên trình duyệt (Desktop và Mobile 360px) và thực hiện kiểm thử chéo với nhóm bạn để ghi nhận, khắc phục các lỗi phát sinh trước khi đóng gói phiên bản `v1.0`.

## 7.2. Kiểm thử đơn vị (Unit Test)
Toàn bộ mã nguồn kiểm thử đơn vị được đặt tại thư mục `backend/test/`, sử dụng thư viện chuẩn `node:test` và `node:assert/strict` của Node.js.

* **Cách chạy kiểm thử:** Di chuyển vào thư mục `backend` và thực thi lệnh:
  ```bash
  npm test

---

| STT | Tệp kiểm thử | Đối tượng kiểm thử | Nội dung kiểm thử chính | Kết quả |
|---|---|---|---|---|
| 1 | `enrollmentService.test.js` | `EnrollmentService` (`HT-04`) | Ghi danh khóa học công khai thành công; từ chối khóa không tồn tại (`404`), khóa nháp (`400`), và từ chối ghi danh trùng lần thứ 2 (`409`). | Pass |
| 2 | `quizService.test.js` | `QuizService` (`HT-06`) | Bắt đầu làm bài (ẩn đáp án đúng, xáo trộn lựa chọn); chấm điểm tự động trên server; từ chối bài nộp quá thời gian (`400`) và vượt quá 3 lượt làm bài. | Pass |
| 3 | `questionService.test.js` | `QuestionService` (`HT-11`) | Giảng viên sở hữu khóa học tạo/sửa câu hỏi 4 lựa chọn hợp lệ; chặn giảng viên không sở hữu khóa học (`403`); kiểm tra dữ liệu thiếu lựa chọn hoặc thời gian `≤ 0` (`400`). | Pass |
| 4 | `courseService.test.js` / `courseRoute.test.js` | `CourseService` (`HT-01`, `HT-09`) | Lọc, tìm kiếm, phân trang danh sách khóa học; kiểm tra quyền sở hữu khi giảng viên chỉnh sửa/xóa khóa học. | Pass |
| 5 | `learningService.test.js` | `LessonService` (`HT-05`) | Chặn học viên chưa ghi danh truy cập nội dung bài học (`403`); ghi nhận hoàn thành bài học và tính phần trăm tiến độ. | Pass |
| 6 | `additionalApis.test.js` & `errorResponse.test.js` | Xác thực & Xử lý lỗi | Kiểm tra mã `401` khi thiếu token, `403` khi sai vai trò và đảm bảo lỗi nội bộ server không làm lộ chi tiết CSDL về client. | Pass |
![alt text](image.png)

---

7.3. Bảng Test Case 12 chức năng bắt buộc
Tài liệu chi tiết kịch bản kiểm thử của toàn bộ dự án được lưu trữ tại docs/test-cases.md (gồm 29 test case, đảm bảo mỗi chức năng bắt buộc có ≥ 2 test case). Bảng 7.2 tổng hợp các kịch bản kiểm thử tiêu biểu đại diện cho 12 chức năng bắt buộc:

| ID | Mã chức năng | Kịch bản & Bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC-01 | HT-01 | Truy cập `/`, nhập từ khóa tìm kiếm và chọn bộ lọc danh mục | Từ khóa: `React`, Danh mục: `Lập trình Web` | Hiển thị danh sách khóa học công khai khớp điều kiện và phân trang đúng | Pass |
| TC-02 | HT-01 | Truy cập `/`, nhập từ khóa không tồn tại | Từ khóa: `KhoaHocKhongTonTai123` | Hiển thị thông báo trạng thái rỗng bằng tiếng Việt, không lỗi giao diện | Pass |
| TC-03 | HT-02 | Mở trang chi tiết khóa học công khai `/courses/1` | `courseId = 1` (`public`) | Hiển thị mô tả, giảng viên, số học viên, tiêu đề bài học (ẩn nội dung bài) | Pass |
| TC-04 | HT-02 | Truy cập đường dẫn chi tiết khóa học không tồn tại `/courses/9999` | `courseId = 9999` | Trả về mã `404` và hiển thị trang thông báo không tìm thấy | Pass |
| TC-05 | HT-03 | Mở `/register`, nhập họ tên, email mới, mật khẩu hợp lệ và đăng ký | `hocvien.moi@gmail.com` / `User@1234` | Tạo tài khoản thành công, mật khẩu băm `bcrypt`, vai trò mặc định `student` | Pass |
| TC-06 | HT-03 | Gửi `POST /api/auth/register` kèm `"role": "admin"` hoặc email đã tồn tại | Email trùng hoặc payload có `"role": "admin"` | Chặn trùng email (`409`); bỏ qua `role` từ client, gán cứng vai trò `student` | Pass |
| TC-07 | HT-04 | Đăng nhập học viên, vào chi tiết khóa học công khai và nhấn "Ghi danh" | Học viên hợp lệ, `courseId = 3` (`public`) | Ghi danh thành công, khóa học hiển thị trong `/my-courses` | Pass |
| TC-08 | HT-04 | Học viên đã ghi danh `courseId = 1` thực hiện ghi danh lại lần thứ 2 | `studentId = 5`, `courseId = 1` | Server từ chối với mã `409`: `"Bạn đã ghi danh khóa học này rồi."` | Pass |
| TC-09 | HT-05 | Học viên đã ghi danh mở bài học `/courses/1/learn/1` và nhấn hoàn thành | Học viên đã ghi danh `courseId = 1` | Hiển thị nội dung bài học/video; lưu tiến độ vào `lesson_progress` | Pass |
| TC-10 | HT-05 | Học viên chưa ghi danh truy cập trực tiếp `/courses/8/learn/36` | Học viên chưa ghi danh `courseId = 8` | Server chặn quyền (`403`) và chuyển về trang chi tiết khóa học (`HT-NFR2`) | Pass |
| TC-11 | HT-06 | Học viên làm bài trắc nghiệm 2 lần (đạt 6/10 và 8/10) và kiểm tra API | 10 câu hỏi, kiểm tra payload `start` qua DevTools | Chấm điểm ở server, lưu điểm cao nhất `8/10`, payload không lộ `correct_answer` | Pass |
| TC-12 | HT-06 | Nộp bài trắc nghiệm sau khi hết thời gian hoặc truy cập khi đã đủ 3 lượt | Thời gian nộp `16p30s` (giới hạn `15p`); đã có 3 lượt | Server từ chối nộp trễ (`400`) và khóa nút làm bài khi hết 3 lượt (`HT-NFR1`) | Pass |
| TC-13 | HT-07 | Học viên vào `/profile` cập nhật họ tên và kiểm tra đổi mật khẩu sai | Tên mới; mật khẩu cũ nhập sai | Lưu tên mới thành công; từ chối đổi mật khẩu (`400`/`401`) khi sai mật khẩu cũ | Pass |
| TC-14 | HT-09 | Giảng viên tạo khóa học mới; Giảng viên A gửi request sửa khóa của Giảng viên B | Dữ liệu khóa học mới; token Giảng viên A sửa `courseId = 3` | Tạo khóa học của mình thành công; chặn sửa khóa người khác (`403`, `HT-NFR3`) | Pass |
| TC-15 | HT-10 | Giảng viên thêm bài học mới có link YouTube; gửi request thiếu tiêu đề | `courseId = 1`, link YouTube; tiêu đề rỗng `""` | Thêm bài học thành công (`HT-NFR4`); báo lỗi validation (`400`) khi rỗng | Pass |
| TC-16 | HT-11 | Giảng viên lưu thời gian thi `20` phút, thêm/sửa câu hỏi 4 đáp án và kiểm tra trùng đáp án | 4 đáp án hợp lệ; trường hợp 2 đáp án trùng nhau | Lưu câu hỏi và giữ đúng vị trí đáp án đã chọn; chặn lưu nếu trùng đáp án (`400`) | Pass |
| TC-17 | HT-14 | Quản trị viên tạo tài khoản giảng viên và khóa một tài khoản học viên | Tài khoản `teacher.new@gmail.com`; khóa `student2` | Tạo giảng viên thành công; tài khoản bị khóa không thể đăng nhập | Pass |
| TC-18 | HT-15 | Quản trị viên xóa danh mục đang có khóa học và ẩn khóa học vi phạm | Xóa danh mục `id = 1`; ẩn `courseId = 2` | Chặn xóa danh mục có khóa học (`RESTRICT`); khóa học bị ẩn khỏi trang chủ | Pass |

---

7.4. Kiểm thử chéo (Cross-testing)
Nhóm thực hiện kiểm thử chéo với nhóm bạn dựa trên bộ test case và luồng nghiệp vụ thực tế của 4 phân hệ. Các lỗi phát hiện trong quá trình kiểm thử nội bộ và kiểm thử chéo đã được ghi nhận, phân loại và khắc phục triệt để:
| STT | Mã chức năng | Mô tả lỗi phát hiện | Mức độ | Trạng thái xử lý |
|---|---|---|---|---|
| 1 | HT-04 | Trang "Khóa học của tôi" (`/my-courses`) bị mất dữ liệu hiển thị hoặc trắng trang khi nhấn `F5` tải lại trang | Trung bình | **Đã sửa** (bổ sung `SafeErrorBoundary` và đồng bộ lưu trữ dữ liệu khóa học) |
| 2 | HT-04 | Giao diện nút ghi danh cho phép bấm liên tiếp khi mạng chậm | Thấp | **Đã sửa** (vô hiệu hóa nút trong lúc gửi request và chặn trùng `409` ở server) |
| 3 | HT-11 | Khi giảng viên đăng nhập được điều hướng nhầm sang trang Quản lý câu hỏi thay vì trang Khóa học | Thấp | **Đã sửa** (cập nhật `HOME_BY_ROLE` và route `/teacher/courses` về `/`) |
| 4 | HT-11 | Sau khi sửa câu hỏi trắc nghiệm, đáp án đúng luôn bị đẩy lên vị trí đầu tiên (A) thay vì giữ vị trí đã chọn | Trung bình | **Đã sửa** (lưu và khôi phục thứ tự lựa chọn trên giao diện quản lý câu hỏi) |
| 5 | HT-01 | Lỗi sau khi merge khiến bấm vào thẻ khóa học chuyển nhầm sang trang làm bài kiểm tra thay vì chi tiết khóa học | Cao | **Đã sửa** (tách riêng 2 nút "Xem chi tiết" và "Làm bài kiểm tra") |

Tổng kết kiểm thử chéo: Tổng số lỗi ghi nhận: 5 lỗi — Đã sửa hoàn tất: 5/5 lỗi (100%).

---

CHƯƠNG 8. QUẢN LÝ MÃ NGUỒN
8.1. Mô hình nhánh và quy tắc commit
Dự án áp dụng mô hình Git Flow rút gọn (quy định chi tiết tại docs/git-rules.md) nhằm kiểm soát chất lượng mã nguồn và tránh xung đột khi 5 thành viên làm việc song song:
    -Hệ thống nhánh:

        -main: Nhánh sản phẩm ổn định dùng để gắn các mốc phiên bản (tag), khóa push trực tiếp, chỉ nhận mã nguồn thông qua Pull Request từ develop.

        -develop: Nhánh tích hợp chính của nhóm, tổng hợp tính năng từ các nhánh chức năng sau khi đã qua kiểm thử và review.

        -feature/HT-xx-mo-ta: Nhánh phát triển từng chức năng (ví dụ: feature/HT-04-ghi-danh, feature/HT-11-cau-hoi).

        -fix/HT-xx-mo-ta, test/HT-xx, docs/mo-ta: Các nhánh chuyên biệt cho sửa lỗi, kiểm thử và cập nhật tài liệu.

    -Quy tắc Commit và Pull Request:

        -Thông điệp commit tuân thủ chuẩn Conventional Commits: <loại>(<mã>): mô tả ngắn gọn (với các loại feat, fix, test, docs, refactor, chore) kèm trailer khai báo hỗ trợ từ AI (AI-assisted: <Công cụ> [AI-xx]).

        -Mọi Pull Request đều sử dụng mẫu chuẩn .github/pull_request_template.md gồm 5 mục bắt buộc (mô tả thay đổi, mã thẻ Trello/chức năng, mã AI log, bằng chứng kiểm thử và ảnh chụp giao diện) và phải có ít nhất 1 thành viên review trước khi merge vào develop.

8.2. Thống kê commit, PR và review theo thành viên
Số liệu đóng góp mã nguồn của 5 thành viên được trích xuất từ lịch sử Git của repository 3tpb-quan-ly-hoc-tap:
| Mã | Thành viên | Vai trò | Số Commit | Số PR đã tạo | Số PR đã Review | Phần công việc đóng góp chính |
|---|---|---|---|---|---|---|
| TV1 | Nguyễn Ngọc Trọng | Leader (LE) | `[75]` | `[36]` | `[24]` | Tài liệu thiết kế, Use Case, Sequence, chức năng `HT-07`, `HT-14`, `HT-15` |
| TV2 | Hà Hữu Thịnh | Backend 1 (BE1) | `[41]` | `[14]` | `[13]` | Kiến trúc 3 lớp, xác thực JWT (`HT-03`), làm bài trắc nghiệm (`HT-06`), unit test |
| TV3 | Lê Đức Phong | Frontend (FE) | `[41]` | `[10]` | `[10]` | Wireframe Figma, layout chung, giao diện `HT-01`, `HT-02`, `HT-03`, `HT-05` |
| TV4 | Nguyễn Quang Thông | Backend 2 (BE2) | `[69]` | `[12]` | `[9]` | Thiết kế ERD 8 bảng, migration/seed Knex, CRUD khóa học & bài học (`HT-09`, `HT-10`) |
| TV5 | Trần Thanh Bình | Git & Tester (GT) | `[56]` | `[10]` | `[5]` | Quy tắc Git, mẫu PR, `HT-04`, `HT-11`, bộ 29 test case, unit test & review PR |
| **Tổng** | **Cả nhóm (5 TV)** | | **`[282]`** | **`[82]`** | **`[61]`** | |

![alt text](image-1.png)
---

8.3. Các tag phiên bản
Nhóm thực hiện đóng gói và đánh dấu các cột mốc hoàn thành quan trọng trực tiếp trên nhánh main:
| Tag | Nhánh gắn | Thời điểm | Nội dung cột mốc đạt được |
|---|---|---|---|
| `v0.1` | `main` | Kết thúc Sprint S1 (Mốc 1) | Hoàn thiện tài liệu thiết kế (Đề cương, Use Case, ERD 8 bảng, Sequence Diagram, Wireframe), khung kiến trúc 3 lớp Backend và layout Frontend. |
| `v0.5` | `main` | Kết thúc Sprint S3 (Mốc giữa kỳ) | Hoàn thành các chức năng nghiệp vụ chính (`HT-01` → `HT-15`), bộ unit test `EnrollmentService`, `QuizService` và bảng 29 test case cho 12 chức năng bắt buộc. |
| `v1.0` | `main` | Kết thúc Sprint S5 (Nộp cuối kỳ) | Hoàn tất khắc phục toàn bộ lỗi kiểm thử chéo (`HT-04`, `HT-11`), hoàn thiện báo cáo cuối kỳ và sẵn sàng bảo vệ sản phẩm. |

---

8.4. Sự cố Git đã gặp và cách xử lý
Trong quá trình làm việc nhóm, hệ thống quản lý phiên bản đã phát sinh một số sự cố thực tế và được xử lý triệt để như sau:

Xung đột (Merge Conflict) trên nhiều tệp và ảnh nhị phân .png khi gộp nhánh:

Nguyên nhân: Các nhánh chức năng tách từ develop ở thời điểm cũ hoặc cùng chỉnh sửa các tệp cấu hình dùng chung (package-lock.json, server.js, App.jsx, ảnh wireframe .png), khiến GitHub không thể tự động gộp trực tuyến.

Cách xử lý: Thực hiện kéo nhánh origin/develop về máy local, sử dụng git merge origin/develop -X theirs kết hợp git checkout --ours cho các tệp tài liệu riêng để đồng bộ toàn bộ mã nguồn mới nhất trước khi đẩy lại lên Pull Request.

Lỗi lệch tham chiếu nhánh remote (fatal: invalid reference) và phát sinh file thừa ở thư mục gốc:

Nguyên nhân: Thành viên mới tạo nhánh trên GitHub nhưng máy local chưa cập nhật danh sách nhánh từ remote, hoặc chạy nhầm lệnh npm install tại thư mục gốc làm sinh ra tệp package-lock.json ngoài ý muốn.

Cách xử lý: Cập nhật quy trình chuẩn cho cả nhóm luôn chạy git fetch --all --prune trước khi chuyển nhánh và kiểm tra git status để loại bỏ các tệp phát sinh ngoài phạm vi trước khi git add.

Sửa lỗi lệch điều hướng và thứ tự đáp án sau khi tích hợp (HT-04, HT-11):

Nguyên nhân: Sau khi gộp các nhánh tính năng vào develop, đường dẫn mặc định của giảng viên trỏ vào trang quản lý câu hỏi và thứ tự đáp án đúng bị sắp xếp lại sau khi cập nhật.

Cách xử lý: Tạo nhánh sửa lỗi riêng, khắc phục dứt điểm logic điều hướng tại roles.js / App.jsx và lưu giữ thứ tự đáp án tại TeacherQuestionsPage.jsx, kiểm thử lại toàn bộ luồng trước khi merge vào develop.