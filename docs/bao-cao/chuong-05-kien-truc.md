## 5.1. Kiến trúc tổng thể hệ thống (Client – Server & 3-Layer Architecture)
Hệ thống quản lý học tập trực tuyến được xây dựng theo mô hình **Client – Server** tách biệt hoàn toàn giữa giao diện người dùng (ReactJS SPA) và máy chủ xử lý nghiệp vụ (Node.js / Express RESTful API), giao tiếp qua định dạng JSON và xác thực bằng JWT (JSON Web Token).

Ở tầng Backend, phần xử lý được tổ chức theo kiến trúc **3 tầng (Controller – Service – Repository)** nhằm tách biệt trách nhiệm (Separation of Concerns). Route và middleware là lớp tiếp nhận, tiền xử lý HTTP trước khi request đến Controller, không tính là một tầng nghiệp vụ riêng. Các thành phần gồm:
- **Route & Middleware (`src/routes/`, `src/middlewares/`):** Khai báo endpoint, xác thực JWT và kiểm tra vai trò. Các hàm `verifyToken`, `authorizeRoles` và `requirePasswordChanged` được định nghĩa trong `src/middlewares/authMiddleware.js`.
1. **Controller (`src/controllers/`):** Đọc và kiểm tra dữ liệu HTTP cần thiết, gọi Service tương ứng, sau đó trả JSON cùng mã trạng thái HTTP phù hợp (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
2. **Service (`src/services/`):** Xử lý nghiệp vụ như băm mật khẩu bằng `bcrypt`, trộn thứ tự đáp án, kiểm tra thời hạn và quyền làm bài, tính điểm, cũng như kiểm tra điều kiện công khai khóa học. Khi bắt đầu bài thi, Service tạo danh sách câu hỏi và lựa chọn đã trộn; đáp án đúng không được gửi cho client.
3. **Repository (`src/repositories/`):** Giao tiếp với MySQL qua `mysql2/promise`, sử dụng truy vấn tham số hóa. Một số thao tác cần tính nhất quán, như tạo lượt thi, dùng transaction và khóa hàng `FOR UPDATE`.

### Luồng đi của một Request tiêu biểu (Nộp bài trắc nghiệm)
`Client (POST /api/quizzes/attempts/:attemptId/submit + Bearer Token)`
$\rightarrow$ `verifyToken` và `authorizeRoles(ROLES.STUDENT)` trong `authMiddleware.js` (xác thực JWT và xác nhận vai trò học viên)
$\rightarrow$ `quizController.submitQuiz()` (kiểm tra `attemptId` và kiểu dữ liệu `answers`)
$\rightarrow$ `quizService.submit()` (đối chiếu chủ sở hữu lượt thi, kiểm tra hạn nộp theo đồng hồ server, lấy câu hỏi hiện tại và tính điểm thang 10)
$\rightarrow$ `quizRepository` (trong transaction, cập nhật lượt thi nếu `submitted_at IS NULL`, lưu `score`, `status = 'submitted'`, `submitted_at` và chi tiết đáp án)
$\rightarrow$ `JSON Response (200 OK kèm điểm số và chi tiết đáp án)`.

**Lưu ý về snapshot bài thi:** Hiện tại, khi bắt đầu, hệ thống lưu nội dung câu hỏi và thứ tự lựa chọn vào `quiz_attempt_answers`, nhưng chưa lưu `correct_answer`. Khi nộp bài, backend đọc lại ngân hàng câu hỏi hiện tại để chấm và mới lưu đáp án đúng vào chi tiết lượt thi. Vì vậy, nếu câu hỏi bị sửa hoặc xóa trong lúc học viên đang làm bài, kết quả có thể dựa trên dữ liệu đã thay đổi; câu hỏi bị xóa cũng có thể không còn trong phần chấm và xem lại. Phần này chưa bảo đảm chấm theo đáp án snapshot ban đầu.

## 5.2. Thiết kế 3 vai trò và cơ chế phân quyền
Hệ thống phân chia quyền hạn chặt chẽ ở tầng Backend dựa trên bảng `users` (ngoài khách vãng lai chưa đăng nhập chỉ xem được thông tin công khai ở trạng thái `public`):

| Vai trò (`users.role`) | Phạm vi chức năng được phép | Cơ chế kiểm soát bảo mật ở Backend |
| :--- | :--- | :--- |
| **Học viên (`student`)** | Đăng ký tài khoản; ghi danh khóa học; học bài (text, video, PDF); làm bài trắc nghiệm (tối đa 3 lượt); xem lịch sử điểm cá nhân. | API đăng ký gán `role = 'student'` (vai trò gửi từ client không được dùng); tài khoản học viên mới mặc định `active`; đăng nhập và request tiếp theo kiểm tra `is_locked`; chỉ cho phép học bài nếu đã ghi danh, khóa học và bài học đang công khai, đồng thời phải học tuần tự (`HT-NFR2`); chỉ được xem/nộp lượt thi thuộc tài khoản của mình. |
| **Giảng viên (`teacher`)** | Tạo/sửa/xóa khóa học của mình; quản lý chương (`chapters`) và bài học (`lessons`: PDF tối đa 5 MB, video qua đường dẫn); soạn câu hỏi trắc nghiệm (`questions`) và đặt thời gian làm bài (`courses.quiz_minutes`). | Tài khoản do Admin cấp, không có API tự đăng ký giảng viên. Cờ `must_change_password` không chặn đăng nhập nhưng chặn một số thao tác quản lý cho đến khi đổi mật khẩu. Các thao tác quản lý khóa học, bài học, chương và câu hỏi kiểm tra quyền sở hữu ở backend; Admin có quyền quản lý theo route/service tương ứng. Khóa học mới bắt đầu ở trạng thái nháp, chỉ được công khai khi có bài học công khai; khóa đã có học viên ghi danh bị hạn chế xóa hoặc chuyển về nháp. |
| **Quản trị viên (`admin`)** | Quản lý người dùng (tạo tài khoản giảng viên, khóa/mở khóa tài khoản qua cột `users.is_locked`); quản lý danh mục (`categories`); duyệt hoặc ẩn khóa học vi phạm (`courses.status`). | Route kiểm tra vai trò bằng `authorizeRoles(ROLES.ADMIN)` trong `authMiddleware.js` (người không đủ quyền nhận `403 Forbidden`); không cho phép tự khóa tài khoản đang sử dụng. Bỏ ẩn khóa học cần có ít nhất một bài học công khai. |