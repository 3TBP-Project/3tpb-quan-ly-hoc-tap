## 5.1. Kiến trúc tổng thể hệ thống (Client – Server & 3-Layer Architecture)
Hệ thống quản lý học tập trực tuyến được xây dựng theo mô hình **Client – Server** tách biệt hoàn toàn giữa giao diện người dùng (ReactJS SPA) và máy chủ xử lý nghiệp vụ (Node.js / Express RESTful API), giao tiếp qua định dạng JSON và xác thực bằng JWT (JSON Web Token).

Ở tầng Backend, mã nguồn được tổ chức theo kiến trúc phân lớp **3 tầng (Controller – Service – Repository)** nhằm đảm bảo tính tách biệt trách nhiệm (Separation of Concerns):
1. **Tầng Route & Middleware (`src/routes/`, `src/middlewares/`):** Tiếp nhận HTTP Request, xác thực chữ ký JWT (`authMiddleware`) và kiểm tra vai trò người dùng (`roleMiddleware`).
2. **Tầng Controller (`src/controllers/`):** Phân tích tham số đầu vào (`req.params`, `req.body`, `req.query`), kiểm tra tính hợp lệ cơ bản, gọi xuống Service tương ứng và chuẩn hóa định dạng JSON phản hồi kèm mã trạng thái HTTP (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
3. **Tầng Service (`src/services/`):** Chứa toàn bộ logic nghiệp vụ cốt lõi và các ràng buộc bảo mật (băm mật khẩu, trộn ngẫu nhiên đáp án, ẩn `correct_answer`, tính hạn nộp bài phía server, chấm điểm thang 10).
4. **Tầng Repository (`src/repositories/`):** Giao tiếp trực tiếp với CSDL MySQL thông qua `mysql2/promise` với truy vấn tham số hóa (Parameterized Queries) và giao dịch cơ sở dữ liệu (Transaction + khóa hàng `FOR UPDATE`).

### Luồng đi của một Request tiêu biểu (Nộp bài trắc nghiệm)
`Client (POST /api/quizzes/attempts/:attemptId/submit + Bearer Token)` 
$\rightarrow$ `authMiddleware` (giải mã JWT lấy `req.user`) 
$\rightarrow$ `roleMiddleware(['student'])` (xác nhận đúng vai trò học viên) 
$\rightarrow$ `quizController.submitQuiz()` (kiểm tra `attemptId` và kiểu dữ liệu `answers`) 
$\rightarrow$ `quizService.submit()` (đối chiếu chủ sở hữu lượt thi, kiểm tra hạn nộp server, đối chiếu đáp án đúng và tính điểm thang 10) 
$\rightarrow$ `quizRepository.updateAttemptResultIfNotSubmitted()` (cập nhật nguyên tử vào bảng `quiz_attempts`) 
$\rightarrow$ `JSON Response (200 OK kèm điểm số và chi tiết đáp án)`.

## 5.2. Thiết kế 3 vai trò và cơ chế phân quyền
Hệ thống phân chia quyền hạn chặt chẽ ở tầng Backend dựa trên trường `role` trong bảng `users` (ngoài khách vãng lai chưa đăng nhập chỉ xem được thông tin công khai):

| Vai trò (`role`) | Phạm vi chức năng được phép | Cơ chế kiểm soát bảo mật ở Backend |
| :--- | :--- | :--- |
| **Học viên (`student`)** | Đăng ký tài khoản; ghi danh khóa học; học bài (text, video, PDF); làm bài trắc nghiệm (tối đa 3 lượt); xem lịch sử điểm cá nhân. | API đăng ký tự động gán cứng `role = 'student'`, bỏ qua mọi tham số `role` từ client; chỉ cho phép xem bài học khi đã có bản ghi trong `enrollments` (`HT-NFR2`); chỉ được nộp bài cho `attemptId` thuộc `user_id` của chính mình. |
| **Giảng viên (`teacher`)** | Tạo/sửa/xóa khóa học của mình; quản lý bài học (upload PDF $\le 5$MB, gắn link video); soạn câu hỏi trắc nghiệm và đặt thời gian làm bài. | Tài khoản do Admin cấp (không tự đăng ký); mọi thao tác sửa/xóa khóa học, bài học, câu hỏi đều kiểm tra điều kiện `course.teacher_id === req.user.id` tại server (`HT-NFR3`). |
| **Quản trị viên (`admin`)** | Quản lý người dùng (tạo tài khoản giảng viên, khóa/mở khóa tài khoản), quản lý danh mục, duyệt hoặc ẩn khóa học vi phạm. Chặn tuyệt đối truy cập từ `student` và `teacher` tại `roleMiddleware(['admin'])` (trả về `403 Forbidden`); không cho phép tự khóa tài khoản của chính mình. |