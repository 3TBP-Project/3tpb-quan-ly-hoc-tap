## 6.1. Cấu trúc mã nguồn Backend và các mẫu thiết kế áp dụng
Mã nguồn Backend đặt tại thư mục `backend/src/` với cấu trúc chuẩn hóa:
* `config/`: Cấu hình kết nối Pool MySQL (`db.js`).
* `middlewares/`: Các middleware xác thực, phân quyền và xử lý tải tệp. `verifyToken`, `authorizeRoles` và `requirePasswordChanged` cùng được định nghĩa trong `authMiddleware.js`; dự án không có tệp `roleMiddleware.js` riêng.
* `routes/`: Định tuyến RESTful API (`authRoute.js`, `quizRoute.js`, ...).
* `controllers/`: Tiếp nhận và điều phối request (`authController.js`, `quizController.js`).
* `services/`: Xử lý nghiệp vụ độc lập (`authService.js`, `quizService.js`).
* `repositories/`: Truy vấn dữ liệu SQL (`userRepository.js`, `quizRepository.js`).

### Các mẫu thiết kế (Design Patterns) và nguyên lý áp dụng
1. **Repository Pattern (`src/repositories/quizRepository.js`, `userRepository.js`):** Gom các truy vấn SQL vào Repository để Service tập trung vào nghiệp vụ. Các truy vấn sử dụng tham số thay vì ghép trực tiếp dữ liệu đầu vào vào câu SQL; có thể thay Repository bằng stub trong một số unit test.
2. **Service Layer Pattern (`src/services/quizService.js`, `courseService.js`):** Tập trung quy tắc nghiệp vụ và phối hợp các thao tác Repository trong Service, giúp Controller không trực tiếp xử lý SQL hay toàn bộ nghiệp vụ.
3. **Middleware / Chain of Responsibility (`src/middlewares/authMiddleware.js`):** Các route ghép middleware như `verifyToken`, `authorizeRoles` và `requirePasswordChanged` để xác thực JWT, kiểm tra trạng thái tài khoản (`is_locked`), vai trò và điều kiện đổi mật khẩu trước khi gọi Controller.
4. **Phân tách trách nhiệm:** Route khai báo endpoint; Controller xử lý giao tiếp HTTP và kiểm tra đầu vào cần thiết; Service xử lý quy tắc nghiệp vụ; Repository truy vấn dữ liệu. Đây là cách tổ chức chính của dự án, không có nghĩa mọi tệp chỉ chứa đúng một hàm hoặc một thao tác.

## 6.2. Phân tích nghiệp vụ tiêu biểu: Chấm trắc nghiệm ở server, giới hạn thời gian và số lượt (`HT-06` & `HT-NFR1`)

### 6.2.1. Ý tưởng giải thuật và kiểm soát ở phía máy chủ
Backend thực hiện các kiểm tra chính ở máy chủ, nhưng cần phân biệt phần dữ liệu snapshot hiện lưu với đáp án đúng thực tế dùng để chấm:
1. **Trộn lựa chọn và lưu nội dung lượt thi:** Khi bắt đầu (`start`), server lấy câu hỏi từ `questions`, trộn bốn lựa chọn bằng **Fisher-Yates Shuffle** và chỉ trả `{ id, content, options }` cho client. Bảng `quiz_attempt_answers` lưu `question_id`, nội dung câu hỏi và các lựa chọn đã trộn; tại thời điểm này `correct_answer` vẫn là `NULL`. Ràng buộc `UNIQUE (attempt_id, question_id)` tránh lưu trùng câu hỏi trong cùng lượt; khóa ngoại `ON DELETE SET NULL` giữ hàng snapshot khi câu hỏi gốc bị xóa. Tuy nhiên, khi nộp bài, code hiện tại thay các hàng chi tiết bằng câu hỏi còn lại trong ngân hàng câu hỏi, nên câu hỏi đã xóa có thể không còn trong kết quả đã nộp.
2. **Giới hạn tối đa 3 lượt và kiểm soát đồng thời:** Repository mở **Database Transaction**, khóa bản ghi ghi danh bằng `FOR UPDATE`, xác nhận học viên đã ghi danh, trước hết tự đóng các lượt bỏ dở đã quá giờ (`status = 'expired'`, `score = 0`); nếu còn một lượt đang làm dở chưa hết giờ thì trả lại đúng lượt đó (`resumed = true`, giữ nguyên thứ tự lựa chọn đã trộn) để F5 hay đóng tab không làm mất lượt; nếu không mới đếm số lượt và tạo lượt mới với `status = 'doing'`. Cách khóa này giúp tuần tự hóa các yêu cầu bắt đầu thi đồng thời của cùng một lượt ghi danh.
3. **Kiểm tra thời hạn:** Server lấy thời điểm bắt đầu và thời điểm nộp bằng đồng hồ ứng dụng, cho phép thời gian làm bài cộng thêm 1 phút dung sai. Nếu quá hạn, service trả lỗi `400` và không chấm bài. Giao diện không tự nộp khi hết giờ: đồng hồ về 0 thì khóa bài làm và báo bài không được ghi nhận. Lượt bỏ dở quá giờ được hệ thống tự đóng (`status = 'expired'`, `score = 0`, `submitted_at` = thời điểm hết giờ) khi học viên bắt đầu lượt mới hoặc mở lịch sử làm bài, và hiện là "Bỏ dở" trong lịch sử.
4. **Chấm điểm và chống nộp trùng:** Khi nộp, service hiện đọc lại câu hỏi và đáp án đúng từ bảng `questions` rồi tính điểm thang 10, làm tròn 2 chữ số. Repository cập nhật lượt thi trong transaction với điều kiện `id`, `user_id` khớp và `submitted_at IS NULL`, sau đó lưu chi tiết đáp án. Code hiện tại không kiểm tra điều kiện `status = 'doing'` trong câu lệnh cập nhật.

**Giới hạn hiện tại của snapshot:** Việc chấm dựa trên ngân hàng câu hỏi ở thời điểm nộp, không phải đáp án đúng đã chụp ở thời điểm bắt đầu. Do đó, nếu câu hỏi được sửa, thêm hoặc xóa trong lúc học viên làm bài, nội dung dùng để chấm có thể khác với đề đã hiển thị. Nếu yêu cầu nghiệp vụ là cố định đề và đáp án theo từng lượt thi, cần bổ sung việc lưu đáp án đúng vào snapshot lúc bắt đầu và chấm từ snapshot; phần đó chưa được triển khai trong code hiện tại.

### 6.2.2. Mã giả thuật toán `start` và `submit`
```text
FUNCTION startQuiz(userId, courseId):
    course <- findCourseById(courseId)
    IF course IS NULL THEN THROW Error(404)
    IF course.status != 'public' THEN THROW Error(404)
    IF course.quiz_minutes IS NULL OR course.quiz_minutes <= 0 THEN THROW Error(400)

    questions <- getQuestionsByCourseId(courseId)
    IF questions IS EMPTY THEN THROW Error(400)

    sanitizedQuestions <- []
    FOR EACH q IN questions DO
        falseOptions <- getThreeFalseOptions(q)
        IF LENGTH(falseOptions) != 3 THEN THROW Error(500)
        options <- shuffleFisherYates([q.correct_answer] + falseOptions)
        APPEND { id: q.id, content: q.content, options } TO sanitizedQuestions
    END FOR

    startedAt <- APPLICATION_SERVER_NOW()
    BEGIN TRANSACTION
        LOCK enrollment(userId, courseId) FOR UPDATE
        IF NOT enrolled THEN ROLLBACK; THROW Error(403)
        attemptCount <- countAttempts(userId, courseId)
        IF attemptCount >= 3 THEN ROLLBACK; THROW Error(403)
        attempt <- insertAttempt(userId, courseId, status = 'doing', started_at = startedAt)
        insertAttemptAnswers(
            attempt.id,
            sanitizedQuestions.map(q => {
                question_id: q.id,
                question_content: q.content,
                options: JSON(q.options),
                selected_answer: NULL,
                correct_answer: NULL,
                is_correct: false
            })
        )
    COMMIT

    RETURN { attemptId: attempt.id, quizDuration: course.quiz_minutes, startedAt, remainingAttempts: 3 - (attemptCount + 1), questions: sanitizedQuestions }
END FUNCTION

FUNCTION submitQuiz(attemptId, userId, studentAnswers):
    attempt <- findAttemptById(attemptId)
    IF attempt IS NULL OR attempt.user_id != userId THEN THROW Error(403/404)
    IF attempt.submitted_at IS NOT NULL THEN THROW Error(400)

    course <- findCourseById(attempt.course_id)
    IF course IS NULL OR course.status != 'public' THEN THROW Error(404)
    now <- APPLICATION_SERVER_NOW()
    deadline <- attempt.started_at + (course.quiz_minutes + 1 minute)
    IF now > deadline THEN
        THROW Error(400)
    END IF

    currentQuestions <- getQuestionsByCourseId(attempt.course_id)
    correctCount <- 0
    details <- []
    FOR EACH q IN currentQuestions DO
        rawSelected <- studentAnswers[q.id]
        selected <- trim(rawSelected) IF rawSelected IS STRING ELSE NULL
        isCorrect <- (selected != NULL AND selected == trim(q.correct_answer))
        IF isCorrect THEN correctCount <- correctCount + 1
        APPEND { questionId: q.id, content: q.content, selectedAnswer: selected, correctAnswer: q.correct_answer, isCorrect } TO details
    END FOR

    computedScore <- IF LENGTH(currentQuestions) > 0 THEN ROUND((correctCount / LENGTH(currentQuestions)) * 10, 2) ELSE 0
    updated <- transaction:
        UPDATE quiz_attempts
        SET score = computedScore, status = 'submitted', submitted_at = now
        WHERE id = attemptId AND user_id = userId AND submitted_at IS NULL
        IF updated THEN save selected_answer, correct_answer, is_correct in quiz_attempt_answers
    IF updated == 0 THEN THROW Error(400, "Lượt thi đã được nộp trước đó")

    RETURN { attemptId, score: computedScore, correctCount, totalQuestions: LENGTH(currentQuestions), details }
END FUNCTION
```

### 6.2.3. Độ phức tạp thuật toán

Gọi `Q₀` là số câu hỏi khi bắt đầu lượt thi, `Q₁` là số câu hỏi hiện có khi nộp bài và `A` là số lượt làm bài đã có của học viên trong khóa học. Phân tích dưới đây tính số thao tác xử lý theo số dòng dữ liệu, giả định các truy vấn định vị bản ghi sử dụng chỉ mục hiện có; thời gian thực tế còn phụ thuộc vào kế hoạch truy vấn, I/O và khóa của MySQL.

| Thao tác | Phân tích | Thời gian | Bộ nhớ phụ |
| --- | --- | --- | --- |
| Bắt đầu lượt thi (`start`) | Đọc và duyệt `Q₀` câu hỏi; mỗi câu có đúng 4 lựa chọn nên trộn đáp án mất `O(1)` cho mỗi câu; ghi snapshot gồm `Q₀` dòng. Việc đếm lượt đọc các bản ghi phù hợp của học viên (`A`). | `O(Q₀ + A)`; với dữ liệu tuân thủ giới hạn tối đa 3 lượt thì `A ≤ 3`, nên rút gọn thành `O(Q₀)`. | `O(Q₀)` để giữ danh sách câu hỏi, lựa chọn đã trộn và dữ liệu ghi snapshot. |
| Nộp bài (`submit`) | Đọc và chấm `Q₁` câu hiện có; trong transaction, đọc snapshot có `Q₀` dòng, tạo chi tiết và ghi lại tối đa `Q₁` dòng. Truy vấn điểm cao nhất cũng đọc các lượt của học viên (`A`). | `O(Q₀ + Q₁ + A)`; với dữ liệu tuân thủ giới hạn 3 lượt, rút gọn thành `O(Q₀ + Q₁)`. Nếu ngân hàng câu hỏi không đổi thì `Q₀ = Q₁ = Q`, thành `O(Q)`. | `O(Q₀ + Q₁)` cho snapshot, danh sách câu hỏi và chi tiết chấm điểm. |
| Trộn 4 lựa chọn | Fisher–Yates chạy tuyến tính theo số lựa chọn; số lựa chọn cố định là 4 trong dự án. | `O(4) = O(1)` cho mỗi câu hỏi. | `O(4) = O(1)` cho mảng lựa chọn tạm. |

Độ phức tạp trên mô tả phần xử lý và số dòng dữ liệu chính của luồng. MySQL thực hiện việc lọc, khóa, đếm và ghi dữ liệu; chi phí cụ thể của các thao tác này phụ thuộc vào chỉ mục, kích thước bảng và mức độ đồng thời.