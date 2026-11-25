# CHƯƠNG 5. THIẾT KẾ HỆ THỐNG – PHẦN CƠ SỞ DỮ LIỆU

## 5.1. Sơ đồ thực thể kết hợp (ERD)

Cơ sở dữ liệu `db_quanlyhoctap` được thiết kế chuẩn hóa theo dạng chuẩn **3NF**, gồm **12 bảng dữ liệu nghiệp vụ** (và 2 bảng hệ thống `knex_migrations`, `knex_migrations_lock` phục vụ quản lý phiên bản migration).

> *[Chèn hình ảnh sơ đồ ERD: `docs/database/erd-final.png`]*

---

## 5.2. Mô tả chi tiết các bảng dữ liệu

### 1. Bảng `users` (Người dùng)
Lưu trữ thông tin tài khoản của 3 vai trò trong hệ thống: Học viên (`student`), Giảng viên (`teacher`) và Quản trị viên (`admin`).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã định danh người dùng |
| `avatar` | `VARCHAR(255)` | `NULL` | Đường dẫn ảnh đại diện |
| `name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên hiển thị |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Email đăng nhập (duy nhất) |
| `password` | `VARCHAR(255)` | `NOT NULL` | Mật khẩu đã mã hóa `bcrypt` |
| `role` | `VARCHAR(255)` | `NOT NULL` | Vai trò (`student`, `teacher`, `admin`) |
| `is_locked` | `TINYINT` | `NOT NULL`, `DEFAULT 0` | `0`: Bình thường, `1`: Bị khóa |
| `status` | `ENUM('pending','active')` | `NOT NULL`, `DEFAULT 'active'` | Trạng thái kích hoạt tài khoản |
| `created_at` | `TIMESTAMP` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo tài khoản |
| `must_change_password` | `TINYINT(1)` | `NOT NULL`, `DEFAULT 0` | Bắt buộc đổi mật khẩu tạm khi đăng nhập (`1`: Có, `0`: Không) |

---

### 2. Bảng `categories` (Danh mục khóa học)
Phân loại các khóa học theo chủ đề/lĩnh vực.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã danh mục |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên danh mục khóa học |

---

### 3. Bảng `courses` (Khóa học)
Lưu trữ thông tin khóa học do giảng viên tạo và quản lý.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã khóa học |
| `thumbnail` | `VARCHAR(255)` | `NULL` | Đường dẫn ảnh bìa khóa học |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tên khóa học |
| `description` | `TEXT` | `NULL` | Mô tả chi tiết khóa học |
| `category_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `categories.id` | Thuộc danh mục nào |
| `user_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `users.id` | Giảng viên sở hữu khóa học |
| `price_course` | `FLOAT` | `DEFAULT 0` | Giá khóa học (mặc định miễn phí `0`) |
| `quiz_minutes` | `INT` | `NULL` | Thời gian làm bài trắc nghiệm (phút) |
| `status` | `ENUM('draft','public','hidden')` | `NOT NULL`, `DEFAULT 'draft'` | Trạng thái hiển thị khóa học |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo khóa học |

- **Chỉ mục (Index):** `category_id`, `user_id`.

---

### 4. Bảng `chapters` (Chương học)
Nhóm các bài học thành từng chương có thứ tự trong một khóa học.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã chương học |
| `course_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `courses.id` | Thuộc khóa học nào |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tên chương học |
| `position` | `INT` | `NOT NULL`, `DEFAULT 1` | Thứ tự hiển thị chương trong khóa học |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo chương |

- **Chỉ mục (Index):** Composite index `(course_id, position)`.

---

### 5. Bảng `lessons` (Bài học)
Lưu trữ nội dung bài học, video YouTube nhúng và tệp PDF đính kèm.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã bài học |
| `course_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `courses.id` | Thuộc khóa học nào |
| `chapter_id` | `INT UNSIGNED` | `NULL`, `FK` → `chapters.id` | Thuộc chương nào (`NULL` nếu chưa phân chương) |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề bài học |
| `content` | `TEXT` | `NULL` | Nội dung văn bản của bài học |
| `status` | `ENUM('draft','public','hidden')` | `NOT NULL`, `DEFAULT 'draft'` | Trạng thái công khai của bài học |
| `video_path` | `VARCHAR(255)` | `NULL` | Đường dẫn video YouTube |
| `file_path` | `VARCHAR(255)` | `NULL` | Đường dẫn tệp PDF tài liệu |
| `position` | `INT` | `NOT NULL`, `DEFAULT 1` | Thứ tự sắp xếp bài học |

- **Chỉ mục (Index):** `(course_id, position)` và `chapter_id`.

---

### 6. Bảng `enrollments` (Ghi danh khóa học)
Ghi nhận mối quan hệ đăng ký học giữa học viên và khóa học.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã lượt ghi danh |
| `user_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `users.id` | Học viên ghi danh |
| `course_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `courses.id` | Khóa học được ghi danh |

- **Ràng buộc duy nhất:** `UNIQUE(user_id, course_id)`.

---

### 7. Bảng `lesson_progress` (Tiến độ bài học)
Theo dõi trạng thái hoàn thành từng bài học của mỗi học viên.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã bản ghi tiến độ |
| `user_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `users.id` | Học viên thực hiện |
| `lesson_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `lessons.id` | Bài học đã hoàn thành |
| `is_completed` | `TINYINT(1)` | `NOT NULL`, `DEFAULT 0` | `0`: Chưa xong, `1`: Đã hoàn thành |

- **Ràng buộc duy nhất:** `UNIQUE(user_id, lesson_id)`.

---

### 8. Bảng `questions` (Ngân hàng câu hỏi trắc nghiệm)
Lưu trữ các câu hỏi trắc nghiệm 4 lựa chọn thuộc từng khóa học.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã câu hỏi |
| `course_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `courses.id` | Thuộc khóa học nào |
| `content` | `TEXT` | `NOT NULL` | Nội dung câu hỏi |
| `correct_answer` | `VARCHAR(255)` | `NOT NULL` | Nội dung đáp án đúng |
| `false_answer` | `VARCHAR(255)` | `NULL` | Đáp án sai 1 |
| `false_answer_2` | `VARCHAR(255)` | `NULL` | Đáp án sai 2 |
| `false_answer_3` | `VARCHAR(255)` | `NULL` | Đáp án sai 3 |

- **Chỉ mục (Index):** `course_id`.

---

### 9. Bảng `quiz_attempts` (Lịch sử làm bài trắc nghiệm)
Lưu thông tin mỗi lượt thi của học viên cho một khóa học.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã lượt làm bài |
| `user_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `users.id` | Học viên làm bài |
| `course_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `courses.id` | Khóa học kiểm tra |
| `score` | `FLOAT` | `NULL` | Điểm số đạt được (NULL khi đang làm) |
| `status` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'doing'` | Trạng thái (`doing`, `submitted`) |
| `started_at` | `DATETIME` | `NULL` | Thời điểm bắt đầu làm bài |
| `submitted_at` | `DATETIME` | `NULL` | Thời điểm nộp bài |

- **Chỉ mục (Index):** `(user_id, course_id)`.

---

### 10. Bảng `quiz_attempt_answers` (Chi tiết câu trả lời bài thi)
Lưu ảnh chụp đề thi, thứ tự đáp án đã xáo trộn và lựa chọn của học viên trong từng lượt làm bài (`HT-07`).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã chi tiết câu trả lời |
| `attempt_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `quiz_attempts.id` | Thuộc lượt làm bài nào |
| `question_id` | `INT UNSIGNED` | `NULL`, `FK` → `questions.id` | Tham chiếu câu hỏi gốc (`SET NULL` nếu câu hỏi bị xóa) |
| `position` | `INT UNSIGNED` | `NOT NULL` | Thứ tự câu hỏi trong lượt làm bài |
| `question_content` | `TEXT` | `NOT NULL` | Nội dung câu hỏi tại thời điểm thi |
| `options` | `TEXT` | `NOT NULL` | Danh sách 4 phương án đã xáo trộn |
| `selected_answer` | `VARCHAR(255)` | `NULL` | Đáp án học viên đã chọn |
| `correct_answer` | `VARCHAR(255)` | `NULL` | Đáp án đúng của câu hỏi |
| `is_correct` | `TINYINT(1)` | `NOT NULL`, `DEFAULT 0` | `1`: Chọn đúng, `0`: Chọn sai |

- **Ràng buộc & Chỉ mục:** `UNIQUE(attempt_id, question_id)` và Index `(attempt_id, position)`.

---

### 11. Bảng `comments` (Đánh giá & Bình luận khóa học)
Lưu đánh giá số sao và nhận xét của học viên đối với khóa học.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã bình luận |
| `course_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `courses.id` | Khóa học được đánh giá |
| `user_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `users.id` | Người viết bình luận |
| `rating` | `INT` | `NULL` | Điểm đánh giá (1–5 sao) |
| `content` | `TEXT` | `NOT NULL` | Nội dung bình luận |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo bình luận |

- **Chỉ mục (Index):** `course_id`, `user_id`.

---

### 12. Bảng `discussions` (Thảo luận / Hỏi đáp bài học)
Lưu các câu hỏi thảo luận và phản hồi phân cấp cha – con trong phạm vi từng bài học.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT UNSIGNED` | `PK`, `AUTO_INCREMENT` | Mã thảo luận |
| `lesson_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `lessons.id` | Thuộc bài học nào |
| `user_id` | `INT UNSIGNED` | `NOT NULL`, `FK` → `users.id` | Người hỏi hoặc người trả lời |
| `parent_id` | `INT UNSIGNED` | `NULL`, `FK` → `discussions.id` | ID câu hỏi gốc (`NULL` nếu là câu hỏi gốc) |
| `content` | `TEXT` | `NOT NULL` | Nội dung trao đổi |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm gửi thảo luận |

- **Chỉ mục (Index):** `lesson_id`, `user_id`, `parent_id`.

---

## 5.3. Các ràng buộc toàn vẹn dữ liệu

1. **Khóa chính (Primary Key):** Tất cả 12 bảng đều sử dụng khóa chính tự tăng `id` kiểu `INT UNSIGNED AUTO_INCREMENT`.
2. **Toàn vẹn tham chiếu (Foreign Key & Cascade):**
   - Các liên kết cha – con chính đều áp dụng **`ON DELETE CASCADE`** (khi xóa khóa học sẽ tự động xóa các chương, bài học, câu hỏi, lượt ghi danh và bình luận liên quan; khi xóa người dùng sẽ xóa dữ liệu phụ thuộc tương ứng).
   - Riêng cột `quiz_attempt_answers.question_id` áp dụng **`ON DELETE SET NULL`** để bảo toàn lịch sử chi tiết bài thi của học viên ngay cả khi giảng viên xóa câu hỏi gốc khỏi ngân hàng câu hỏi.
3. **Tính duy nhất (Unique Constraints):**
   - `users.email`: Ngăn đăng ký trùng email.
   - `enrollments(user_id, course_id)`: Mỗi học viên chỉ được ghi danh một lần vào cùng một khóa học.
   - `lesson_progress(user_id, lesson_id)`: Mỗi bài học chỉ có tối đa một bản ghi tiến độ cho mỗi học viên.
   - `quiz_attempt_answers(attempt_id, question_id)`: Tránh lưu trùng lặp cùng một câu hỏi trong cùng một lượt làm bài.

---

## 5.4. Cách tính tiến độ học tập (`HT-04`)

Tiến độ hoàn thành khóa học của học viên được tính toán tự động tại tầng dữ liệu và Backend dựa trên hai bảng `lessons` và `lesson_progress` (hàm `calcProgressPercent` trong `backend/src/utils/progress.js`):

1. **Tổng số bài học (`totalCount`):** Đếm số bài học ở trạng thái công khai (`lessons.status = 'public'`) thuộc khóa học đang xét (`courses.status = 'public'`). Các bài ở trạng thái nháp (`draft`) hoặc ẩn (`hidden`) không được tính vào mẫu số.
2. **Số bài đã hoàn thành (`completedCount`):** Đếm số bài học công khai trong khóa học đó mà học viên có bản ghi `lesson_progress.is_completed = 1`.
3. **Công thức tính phần trăm:**
   $$\text{Tiến độ (\%)} = \text{round}\left(\frac{\text{completedCount}}{\text{totalCount}} \times 100\right)$$
   - Nếu `totalCount <= 0` thì kết quả mặc định là `0%`.
   - Kết quả làm tròn số nguyên gần nhất và luôn giới hạn trong khoảng `[0, 100]`.
