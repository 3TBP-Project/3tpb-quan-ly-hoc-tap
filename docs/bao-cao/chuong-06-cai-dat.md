## 6.1. Cấu trúc mã nguồn Backend và các mẫu thiết kế áp dụng
Mã nguồn Backend đặt tại thư mục `backend/src/` với cấu trúc chuẩn hóa:
* `config/`: Cấu hình kết nối Pool MySQL (`db.js`).
* `middlewares/`: Các bộ lọc chặn tiền xử lý (`authMiddleware.js`, `roleMiddleware.js`).
* `routes/`: Định tuyến RESTful API (`authRoute.js`, `quizRoute.js`, ...).
* `controllers/`: Tiếp nhận và điều phối request (`authController.js`, `quizController.js`).
* `services/`: Xử lý nghiệp vụ độc lập (`authService.js`, `quizService.js`).
* `repositories/`: Truy vấn dữ liệu SQL (`userRepository.js`, `quizRepository.js`).

### Các mẫu thiết kế (Design Patterns) và nguyên lý áp dụng
1. **Repository Pattern (`src/repositories/quizRepository.js`, `userRepository.js`):** Tách biệt hoàn toàn câu lệnh SQL khỏi tầng xử lý nghiệp vụ (`Service`), giúp dễ viết Unit Test bằng cách mock các hàm Repository và ngăn ngừa lỗ hổng SQL Injection thông qua Prepared Statements (`?`).
2. **Chain of Responsibility / Middleware Pattern (`src/middlewares/authMiddleware.js`, `roleMiddleware.js`):** Chuỗi hàm trung gian trong Express xử lý tuần tự các bước xác thực token và kiểm tra phân quyền trước khi request chạm tới Controller.
3. **Single Responsibility Principle (Nguyên lý đơn trách nhiệm - SOLID):** Mỗi tệp chỉ đảm nhiệm một vai trò duy nhất (ví dụ `quizController` chỉ validate HTTP input/output, `quizService` chỉ tính toán nghiệp vụ chấm thi và thời gian).

## 6.2. Phân tích nghiệp vụ tiêu biểu: Chấm trắc nghiệm ở server, giới hạn thời gian và số lượt (`HT-06` & `HT-NFR1`)

### Ý tưởng giải thuật & Phòng chống gian lận
Để đáp ứng yêu cầu bảo mật **HT-NFR1**, hệ thống áp dụng 4 nguyên tắc kiểm soát hoàn toàn tại máy chủ:
1. **Ẩn đáp án đúng trước khi nộp:** Khi học viên gọi API bắt đầu thi (`start`), server lấy 1 đáp án đúng (`correct_answer`) gộp với 3 đáp án sai (`false_answer`), trộn ngẫu nhiên bằng thuật toán **Fisher-Yates Shuffle** rồi loại bỏ hoàn toàn trường `correct_answer` khỏi JSON trả về.
2. **Chống vượt quá 3 lượt thi (Concurrency Control):** Quá trình kiểm tra ghi danh, đếm số lượt đã thi (`count < 3`) và chèn bản ghi `quiz_attempts` mới được bọc trong một **Database Transaction** kèm khóa hàng (`FOR UPDATE`), ngăn chặn lỗi Race Condition khi người dùng gửi đồng thời nhiều request.
3. **Tính giờ làm bài tại Server:** Mốc bắt đầu (`started_at`) được ghi theo đồng hồ máy chủ. Khi học viên nộp bài (`submit`), server kiểm tra thời điểm hiện tại `now` không vượt quá `started_at + quiz_duration + 1 phút` (1 phút dung sai độ trễ mạng); mọi bài nộp trễ đều bị từ chối với mã lỗi `400`.
4. **Chấm điểm nguyên tử (Atomic Update):** Server tự đối chiếu đáp án học viên gửi lên với `correct_answer` trong CSDL, tính điểm thang 10 làm tròn 2 chữ số thập phân và cập nhật với điều kiện `WHERE id = ? AND submitted_at IS NULL` để chống nộp trùng một lượt thi.

### Mã giả (Pseudocode) thuật toán `start` và `submit`
```text
FUNCTION startQuiz(userId, courseId):
    course <- findCourseById(courseId)
    IF course IS NULL OR course.quiz_duration <= 0 THEN THROW Error(400/404)

    questions <- getQuestionsByCourseId(courseId)
    IF questions IS EMPTY THEN THROW Error(400)

    sanitizedQuestions <- []
    FOR EACH q IN questions DO
        options <- shuffleFisherYates([q.correct_answer] + parseArray(q.false_answer))
        APPEND { id: q.id, content: q.content, options: options } TO sanitizedQuestions
    END FOR

    BEGIN TRANSACTION
        LOCK user_course_enrollment(userId, courseId) FOR UPDATE
        IF NOT enrolled THEN ROLLBACK; THROW Error(403)
        attemptCount <- countAttempts(userId, courseId)
        IF attemptCount >= 3 THEN ROLLBACK; THROW Error(403)
        attempt <- insertAttempt(userId, courseId, started_at = SERVER_NOW())
    COMMIT

    RETURN { attemptId: attempt.id, quizDuration: course.quiz_duration, questions: sanitizedQuestions }
END FUNCTION

FUNCTION submitQuiz(attemptId, userId, studentAnswers):
    attempt <- findAttemptById(attemptId)
    IF attempt IS NULL OR attempt.user_id != userId THEN THROW Error(403/404)
    IF attempt.submitted_at IS NOT NULL THEN THROW Error(400)

    course <- findCourseById(attempt.course_id)
    deadline <- attempt.started_at + (course.quiz_duration + 1 minute)
    IF SERVER_NOW() > deadline THEN THROW Error(400, "Quá thời gian làm bài")

    questions <- getQuestionsByCourseId(attempt.course_id)
    correctCount <- 0
    details <- []

    FOR EACH q IN questions DO
        selected <- trim(studentAnswers[q.id])
        isCorrect <- (selected != NULL AND selected == trim(q.correct_answer))
        IF isCorrect THEN correctCount <- correctCount + 1
        APPEND { questionId: q.id, selectedAnswer: selected, correctAnswer: q.correct_answer, isCorrect } TO details
    END FOR

    score <- ROUND((correctCount / LENGTH(questions)) * 10, 2)
    updated <- executeSQL("UPDATE quiz_attempts SET score = ?, submitted_at = ? WHERE id = ? AND submitted_at IS NULL")
    IF updated == 0 THEN THROW Error(400, "Lượt thi đã được nộp trước đó")

    RETURN { attemptId, score, correctCount, totalQuestions: LENGTH(questions), details }
END FUNCTION