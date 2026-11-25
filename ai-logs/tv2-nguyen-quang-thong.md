### [AI-01] Kết nối cơ sở dữ liệu
- Ngày / Người dùng: 2026-11-11 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: Commit `chore :cau hinh ket noi csdl`
- Mục đích:Kết nối csdl
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
- Kết quả AI trả về (tóm tắt): 
- Đánh giá: Đủ
- Đã chỉnh sửa gì: Không điều chỉnh gì cả
- Cách kiểm chứng: Chạy test trên Terminal
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Biết được cách cấu hình kết nối csdl

### [AI-02] Xây dựng chức năng đăng ký và băm mật khẩu (HT-03)
- Ngày / Người dùng: 2026-11-12 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: commit `feat(HT-03): dang ky hoc vien bam mat khau.`
- Mục đích: Tìm hiểu cơ chế băm mật khẩu an toàn với `bcrypt` và sinh mã mẫu luồng Đăng ký
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Tạo chức năng đăng ký và băm mật khẩu
- Kết quả AI trả về (tóm tắt): Cung cấp mã nguồn 3 lớp kèm logic kiểm tra đầu vào tiếng Việt, chặn trùng email, ép vai trò mặc định `student` khi đăng ký và cấp JWT token khi đăng nhập.
- Đánh giá: Thiếu
- Đã chỉnh sửa gì: Sửa lại tên một số trường dữ liệu và câu lệnh SQL `SELECT`/`INSERT` trong `userRepository.js` và `authService.js` từ `full_name`, `password_hash` thành `name`, `password` cho khớp với CSDL MySQL của nhóm.
- Cách kiểm chứng: Chạy test trên Terminal và kiểm tra trên MY SQL
- Tỷ lệ mã AI còn giữ lại (ước lượng): 90%
- Điều học được: Hiểu thêm được phần băm mật khẩu `bcrypt` 

### [AI-03] Xây dựng chức năng đăng nhập và phân quyền 3 vai trò (HT-03)
- Ngày / Người dùng: 2026-11-12 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: commit `feat(HT-03): dang nhap phan quyen 3 vai tro.`
- Mục đích: Xây dựng luồng đăng nhập bằng email/mật khẩu, phát hành JWT và giới hạn truy cập theo ba vai trò `student`, `teacher`, `admin`.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Tạo chức năng đăng nhập và phân quyền 3 vai trò
- Kết quả AI trả về (tóm tắt): Đăng nhập tìm tài khoản, đối chiếu mật khẩu đã băm bằng `bcrypt`, từ chối tài khoản bị khóa, sau đó cấp JWT có thời hạn 1 ngày và trả đường dẫn điều hướng theo vai trò. Middleware xác minh JWT và kiểm tra quyền trước khi cho truy cập các route dashboard.
- Đánh giá: Đủ vì đã đáp ứng đủ các yêu cầu đặt ra.
- Đã chỉnh sửa gì: Điều chỉnh truy vấn repository để khớp tên cột mật khẩu thực tế trong MySQL.Đã thử gọi API đăng nhập và route dashboard bằng PowerShell.
- Cách kiểm chứng: Chạy `npm run dev` bên BackEnd và `npm run dev` bên FrontEnd kiểm tra trên trình duyệt.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 98%
- Điều học được: Hiểu cách dùng JWT để xác thực request và middleware để kiểm tra vai trò.

### [AI-04] Xây dựng khung QuizService
- Ngày / Người dùng: 2026-11-16 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: commit `feat(HT-06): khung QuizService.`
- Mục đích: Thiết kế mã giả và giới hạn lượt làm bài < 3 , thời gian nộp bài quá hạn sẽ bị từ chối.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Thực hiện công việc của ngày 6 thứ 2 tuần 2
- Kết quả AI trả về (tóm tắt): Đưa ra code và các vị trí để viết code, đáp ứng với yêu cầu dự án.
- Đánh giá: Đủ
- Đã chỉnh sửa gì: Thay đổi, thêm một số cột còn thiếu so với CSDL  
- Cách kiểm chứng: Đối chiếu từng bước xử lý với đặc tả chức năng HT-06 và yêu cầu phi chức năng HT-NFR1.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Luôn kiểm tra thời gian gửi từ trình duyệt,kiểm tra hạn nộp đối chiếu đáp án độc lập ở server.

### [AI-05] Cài đặt start() và submit() và theo mã giả và tạo 2 unit test
- Ngày / Người dùng: 2026-11-17 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình
- Task / Commit / PR: commit `feat(HT-06): cham trac nghiem o server va nop tre bi tu choi.`.
- Mục đích: Hoàn thiện luồng bắt đầu và nộp bài trắc nghiệm, kiểm tra việc chấm điểm ở server và từ chối bài nộp quá hạn.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Hoàn thiện `QuizService.start()` và `submit()` theo mã giả HT-06; viết 2 unit test kiểm tra 8/10 câu đúng được 8 điểm và bài nộp sau hạn bị từ chối.
- Kết quả AI trả về (tóm tắt): Hai unit test cho `submit()`: một kiểm tra điểm 8/10 bằng 8, một kiểm tra quá hạn bị từ chối và không lưu kết quả.
- Đánh giá: Đủ 
- Đã chỉnh sửa gì: Thêm 2 unit test trong `backend/test/quizService.test.js`, cập nhật lệnh test thành `node --test` và sửa các đường dẫn `require` để nạp được QuizService, repository và route.
- Cách kiểm chứng: Chạy `npm test` tại `backend` (4 test đạt) và chạy riêng test quá hạn bằng `node --test --test-name-pattern='past the deadline' test\quizService.test.js` (1 test đạt). Dùng AI để có lệnh chạy test.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Server phải tự đối chiếu đáp án và thời hạn nộp.

### [AI-06] Tạo giao diện làm bài kiểm tra trắc nghiệm
- Ngày / Người dùng: 2026-11-18 / Nguyễn Quang Thông
- Công cụ: Gemini + GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình
- Task / Commit / PR: [HT-06]/ commit `feat(HT-06): giao dien lam bai ket qua.`. / #40
- Mục đích: Tạo ra giao diện làm bài trắc nghiệm có đồng hồ đếm ngược, sau khi hoàn thành bài thi nộp bài sẽ hiện ra điểm và số lượt làm bài còn lại, chặn nếu học viên chưa đăng ký khóa học.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Thực hiện nhiệm vụ ngày 8 thứ 4 tuần 2.
- Kết quả AI trả về (tóm tắt): Gemini trả về cấu trúc cần thêm cho dự án và các code, mã nguồn cần thiết cho dự án và GitHud thực hiện rà soát lại những file vừa tạo để đảm bảo đã động bộ mã nguồn cho dự án.
- Đánh giá: Đủ
- Đã chỉnh sửa gì: Không chỉnh sửa gì.
- Cách kiểm chứng: Nhờ GitHud Copilot rà soát lại file đã thêm và chạy trình duyệt bằng lệnh `npm run dev` ở backend và frontend, sau khi vào đường dẫn đăng nhập và gõ đường dẫn `/cousers/1/quiz` để kiểm tra thử.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Hiểu cách giao diện làm bài gọi API, từ frontend nhận câu hỏi và thời gian từ backend, gửi đáp án khi người dùng nhấp nộp bài, động hồ trên giao diện hiển thị để cho người dùng dễ theo dõi thời gian làm bài, nhưng thật chất thời gian sẽ do server kiểm tra để đảm bảo tính chính xác.

### [AI-07] Rà soát sơ bộ thời hạn nộp bài trắc nghiệm
- Ngày / Người dùng: 2026-11-19 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Kiểm thử
- Mục đích: Kiểm tra việc người dùng sửa đồng hồ hoặc mã phía trình duyệt bằng F12 có thể kéo dài thời gian làm bài hay không.
- Prompt chính: Nếu người dùng bật F12 rồi sửa thời gian thì sao?
- Kết quả AI trả về (tóm tắt): Đối chiếu đồng hồ frontend với logic kiểm tra hạn nộp trong backend. Frontend chỉ hiển thị thời gian và tự gửi bài khi hết giờ, backend so thời điểm bắt đầu đã lưu với thời gian server để quyết định nhận hoặc từ chối bài nộp. Backend hiện có thêm 1 phút dung sai.
- Đánh giá: Thiếu vì chỉ giải thích luồng hiện tại, chưa phải kiểm thử bảo mật toàn diện.
- Đã chỉnh sửa gì: Không chỉnh sửa mã nguồn trong lần rà soát này.
- Cách kiểm chứng: Đọc `QuizTimer.jsx`, `QuizPage.jsx` và `quizService.js`; chưa thực hiện kiểm thử động hành vi sửa request hoặc giả lập hết hạn.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Không nên tin thời gian do trình duyệt gửi, server cần tự kiểm tra hạn nộp. Khi ghi nhận phát hiện bảo mật, cần kiểm chứng bằng thử nghiệm trước khi kết luận.

### [AI-08] Rà soát quyền truy cập API và xử lý lỗi nội bộ
- Ngày / Người dùng: 2026-11-19 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Rà soát / Kiểm thử
- Task / Commit / PR: Khắc phục bảo vệ API quản lý khóa học và lỗi ẩn.
- Mục đích: Kiểm tra xác thực/phân quyền API, truy vấn database và nguy cơ tiết lộ thông tin nhạy cảm trong phản hồi lỗi.
- Prompt chính: Kiểm tra đầu vào, quyền truy cập, truy vấn database và thông tin nhạy cảm trong phản hồi/lỗi của backend.
- Kết quả AI trả về (tóm tắt): Rà soát tĩnh phát hiện các route quản lý khóa học chưa gắn middleware giảng viên và một số controller trả nguyên thông báo lỗi nội bộ cho client. Các truy vấn lọc đã kiểm tra sử dụng tham số hóa.
- Đánh giá: Đủ
- Đã chỉnh sửa gì: Bảo vệ API tạo/xem khóa học của giảng viên/cập nhật/xóa bằng xác thực JWT và vai trò giảng viên, phản hồi lỗi 500 để chỉ ghi chi tiết ở log server và trả thông báo chung cho client.
- Cách kiểm chứng: `npm test` tại `backend` (15/15 test đạt), gồm kiểm tra request không token nhận 401, học viên nhận 403 và lỗi nội bộ không bị lộ trong phản hồi.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Cần bảo vệ API ở route bằng xác thực/phân quyền, tiếp tục kiểm tra quyền sở hữu ở service, và không gửi chi tiết lỗi hệ thống hoặc database về client.

### [AI-09] Bổ sung API người dùng, bài học, ghi danh, câu hỏi và quản trị
- Ngày / Người dùng: 2026-11-19 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình / Kiểm thử
- Task / Commit / PR: Commit "feat: Bo sung cac API con thieu" / #45
- Mục đích: Hoàn thiện các API hồ sơ người dùng, khóa học đã ghi danh, bài học và tiến độ, ngân hàng câu hỏi, đánh giá/thảo luận, ghi danh và quản trị tài khoản.
- Prompt chính: Theo cấu trúc dự án, xác định API còn thiếu và triển khai đầy đủ controller, service, repository, route cùng test cho backend.
- Kết quả AI trả về (tóm tắt): Thêm các API quản lý người dùng, bài học, ghi danh và tiến độ học tập, câu hỏi trắc nghiệm, đánh giá và thảo luận cùng quản trị tài khoản. Bổ sung đăng ký route trong server, middleware phân quyền theo vai trò và kiểm thử xác thực cho từng nhóm API.
- Đánh giá: Đủ
- Đã chỉnh sửa gì: Tích hợp các controller, service, repository và route mới; loại bỏ marker xung đột khi khôi phục thay đổi, rà soát và giữ các route của khóa học, học viên, giảng viên và quản trị trong cấu trúc server.
- Cách kiểm chứng: Chạy `npm test` trong thư mục `backend`; kết quả đạt 35/35 test, bao gồm xác thực, phân quyền, ghi danh, tiến độ học tập, câu hỏi và bảo vệ dữ liệu trong phản hồi lỗi.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Cần triển khai API theo đầy đủ ba lớp của dự án, dùng middleware phân quyền tại route, kiểm tra quyền sở hữu ở service và giải quyết xung đột bằng cách tích hợp cả hai phần thay đổi thay vì chọn bỏ một phần.

### [AI-10] Chặn công khai khóa học chưa có bài học công khai (HT-09)
- Ngày / Người dùng: 2026-11-24 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình / Kiểm thử
- Task / Commit / PR: [HT-09] / commit `edd5ea3`
- Mục đích: Không cho khóa học chưa có bài học công khai xuất hiện cho học viên, được ghi danh hoặc bắt đầu học/làm bài.
- Prompt chính: Nếu khóa học có ít hơn một bài học thì không cho phép công khai, chỉ để ở trạng thái bản nháp; hãy thực hiện luồng này.
- Kết quả AI trả về (tóm tắt): Bổ sung kiểm tra ở backend để chỉ cho công khai khóa học khi có bài học công khai; chặn học, ghi danh và làm bài với khóa học không công khai. Khóa không có bài công khai được loại khỏi danh sách công khai.
- Đánh giá: Đủ kiểm tra được thực hiện ở backend, không chỉ dựa vào giao diện.
- Đã chỉnh sửa gì: Thêm kiểm tra trạng thái và số bài học công khai khi tạo/cập nhật khóa học; chặn ghi danh, truy cập nội dung học và bài kiểm tra khi khóa học không công khai. Bổ sung luồng đưa khóa học về nháp khi không còn bài học công khai, cảnh báo ở giao diện giảng viên và cập nhật trạng thái các khóa cũ công khai nhưng không có bài.
- Cách kiểm chứng: `node --test --test-name-pattern="rejects publishing a course without public lessons" test/courseService.test.js` tại `backend` (1/1 đạt), kiểm thử ghi danh 6/6 đạt, build frontend thành công. Gọi API thực tế xác nhận khóa học không có bài công khai bị từ chối khi chuyển sang công khai.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Quy tắc công khai phải được xác thực ở backend và cần chặn đồng bộ ở danh sách khóa học, ghi danh, học bài và làm bài kiểm tra.

### [AI-11] Bảo vệ khóa học đã có học viên ghi danh khỏi bị xóa (HT-09)
- Ngày / Người dùng: 2026-11-25 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình / Kiểm thử
- Task / Commit / PR: [HT-09] / commit `be7939d`
- Mục đích: Giữ lại khóa học và nội dung liên quan khi đã có học viên ghi danh, tránh làm mất dữ liệu học tập.
- Prompt chính: Không cho xóa khóa học khi đã có học viên ghi danh, cần xử lý nhất quán ở backend và thông báo phù hợp trên giao diện.
- Kết quả AI trả về (tóm tắt): Backend kiểm tra số lượt ghi danh trước khi xóa khóa học; trả lỗi xung đột nếu còn học viên. Đồng thời ngăn chuyển khóa học về nháp hoặc ẩn/xóa bài học công khai cuối cùng khi việc đó làm ảnh hưởng khóa học đã có học viên.
- Đánh giá: Đủ có kiểm tra trường hợp giáo viên/quản trị viên, khóa không có học viên và tình huống ghi danh xảy ra ngay trước thao tác xóa.
- Đã chỉnh sửa gì: Bổ sung kiểm tra số học viên ghi danh trong service/repository, hiển thị và xử lý lỗi phù hợp ở trang quản lý khóa học, thêm test cho xóa khóa học, chuyển trạng thái và thay đổi bài học.
- Cách kiểm chứng: `node --test test/courseEnrollmentGuard.test.js test/enrollmentService.test.js` tại `backend` (15/15 test đạt).
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Cần kiểm tra ràng buộc dữ liệu ở server và xử lý cả điều kiện tranh chấp trước khi xóa, không chỉ ẩn hoặc vô hiệu hóa nút ở giao diện.


### [AI-12] Rà soát và hoàn thiện nội dung Chương 5, Chương 6
- Ngày / Người dùng: 2026-11-25 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Viết báo cáo / Rà soát tài liệu
- Task / Commit / PR: Cập nhật `docs/bao-cao/chuong-05-kien-truc.md` và `docs/bao-cao/chuong-06-cai-dat.md`
- Mục đích: Đối chiếu nội dung kiến trúc và nghiệp vụ trắc nghiệm trong báo cáo với mã nguồn hiện tại, sau đó trình bày Chương 6 tập trung vào mẫu thiết kế, nghiệp vụ chấm thi, mã giả và độ phức tạp.
- Prompt chính (nguyên văn): “kiểm tra xem 2 file: chuong-05-kien-truc.md và chuong-06-cai-dat.md có ổn chưa, có đúng với dự án không?”; “sửa bổ sung nếu thiếu và sửa nếu sai”; “chương 6: mẫu thiết kế, nghiệp vụ tiêu biểu ‘Chấm trắc nghiệm ở server, giới hạn thời gian và số lượt’ (mã giả, độ phức tạp).”
- Kết quả AI trả về (tóm tắt): Rà soát kiến trúc backend, phân quyền và luồng thi với source; chỉnh các mô tả chưa khớp về middleware, snapshot câu hỏi, kiểm tra hạn nộp và cập nhật lượt thi. Tổ chức lại Chương 6 để làm rõ Repository, Service Layer, Middleware/Chain of Responsibility, mã giả `start`/`submit`, cùng phân tích thời gian và bộ nhớ theo số câu hỏi và số lượt thi.
- Đánh giá: Đủ; nội dung được đối chiếu trực tiếp với các service, repository, middleware và migration của dự án. Những giới hạn đang có trong code được ghi rõ thay vì mô tả như tính năng đã hoàn thiện.
- Đã chỉnh sửa gì: Cập nhật hai file báo cáo Markdown; Chương 5 làm rõ kiến trúc Controller–Service–Repository và phân quyền; Chương 6 sửa mã giả, nêu giới hạn snapshot/timeout hiện tại và bổ sung bảng độ phức tạp. Không thay đổi mã nguồn ứng dụng.
- Cách kiểm chứng: Đối chiếu với `backend/src/services/quizService.js`, `backend/src/repositories/quizRepository.js`, `backend/src/middlewares/authMiddleware.js` và migration `quiz_attempt_answers`; chạy `git diff --check` (đạt). Không chạy test ứng dụng vì chỉ thay đổi tài liệu.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100% nội dung tài liệu được giữ sau khi rà soát theo yêu cầu.
- Điều học được: Khi mô tả giải thuật trong báo cáo cần phân biệt hành vi thực tế với hướng cải tiến; phân tích Big-O cũng cần nêu rõ giả định về số câu hỏi, dữ liệu và chỉ mục cơ sở dữ liệu.

### [AI-13] Sửa lỗi dư cột `false_answer_4` ở seed và truy vấn câu hỏi (HT-06)
- Ngày / Người dùng: 2026-11-18 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình / Kiểm thử
- Task / Commit / PR: [HT-06] / commit `466065e`
- Mục đích: Khắc phục lỗi truy vấn và dữ liệu mẫu tham chiếu cột `false_answer_4` không tồn tại trong bảng `questions` (chỉ có `correct_answer`, `false_answer`, `false_answer_2`, `false_answer_3`).
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Bổ sung hồi cứu từ lịch sử commit `466065e` (không còn lưu nguyên văn prompt).
- Kết quả AI trả về (tóm tắt): Loại bỏ cột `false_answer_4` khỏi câu lệnh `SELECT` trong `quizRepository.getQuestionsByCourseId`, xóa trường dư trong `Database/seeds/01_seed_data.js` và bổ sung unit test kiểm tra câu SQL chỉ chọn đúng 3 cột đáp án sai.
- Đánh giá: Đủ; xử lý đúng nguyên nhân lệch schema giữa migration bảng `questions` với repository và seed.
- Đã chỉnh sửa gì: Cập nhật `Database/seeds/01_seed_data.js`, `backend/src/repositories/quizRepository.js` và thêm test `getQuestionsByCourseId selects only the three configured distractor columns` trong `backend/test/quizRepository.test.js`.
- Cách kiểm chứng: Chạy `node --test test/quizRepository.test.js` tại `backend` (2/2 test đạt).
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Cần viết unit test kiểm tra trực tiếp câu truy vấn repository khớp với schema bảng trong migration để tránh lỗi cột không tồn tại khi chạy với MySQL.

### [AI-14] Điều chỉnh lọc danh sách khóa học và thông báo xác thực
- Ngày / Người dùng: 2026-11-19 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Lập trình / Kiểm thử
- Task / Commit / PR: commit `5cfe7e9`
- Mục đích: Hỗ trợ lọc danh sách khóa học theo từ khóa `search`, `categoryId`, `teacherId` ở cả controller và repository, kiểm tra tham số đầu vào hợp lệ và làm rõ thông báo lỗi token ở `authMiddleware`.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Bổ sung hồi cứu từ lịch sử commit `5cfe7e9` (không còn lưu nguyên văn prompt).
- Kết quả AI trả về (tóm tắt): Bổ sung `parseOptionalPositiveInteger` và kiểm tra đầu vào trong `courseController.listCourses`, dựng mệnh đề `WHERE` tham số hóa động cho cả truy vấn danh sách lẫn `COUNT(*)` trong `courseRepository.findPage`, cập nhật thông báo 401 trong `authMiddleware.js` và viết unit test kiểm tra lọc.
- Đánh giá: Đủ; đảm bảo tham số hóa truy vấn SQL (tránh SQL injection) và đồng bộ điều kiện lọc giữa danh sách phân trang với tổng số bản ghi.
- Đã chỉnh sửa gì: Cập nhật `backend/src/controllers/courseController.js`, `backend/src/repositories/courseRepository.js`, `backend/src/middlewares/authMiddleware.js`, bổ sung test trong `backend/test/courseController.test.js` và tạo `backend/test/courseRepository.test.js`.
- Cách kiểm chứng: Chạy `node --test test/courseController.test.js test/courseRepository.test.js` tại `backend` (9/9 test đạt).
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Khi thêm bộ lọc phân trang ở API, phải áp dụng cùng điều kiện `WHERE` và danh sách tham số cho cả truy vấn lấy dữ liệu lẫn truy vấn `COUNT(*)`.

### [AI-15] Bổ sung unit test giới hạn 3 lượt làm bài và điểm cao nhất (HT-06)
- Ngày / Người dùng: 2026-11-21 / Nguyễn Quang Thông
- Công cụ: GitHub Copilot (Copilot SDK trong VS Code)
- Giai đoạn: Kiểm thử
- Task / Commit / PR: [HT-06] / commit `1fd3d1f` (nhánh `test/HT-06`, merge `453b12f`; trong mã nguồn từng gắn nhãn tạm `[AI-10]`)
- Mục đích: Bổ sung các unit test bắt buộc cho luồng trắc nghiệm: chặn khi hết tối đa 3 lượt làm bài, trả về điểm cao nhất qua nhiều lượt, chặn học viên chưa ghi danh và chặn nộp trùng lượt đã nộp; đồng thời cập nhật mock/chữ ký hàm trong một số test liên quan.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Bổ sung hồi cứu từ lịch sử commit `1fd3d1f` (không còn lưu nguyên văn prompt).
- Kết quả AI trả về (tóm tắt): Thêm 4 unit test trong `backend/test/quizService.test.js` (chặn quá 3 lượt, lấy `bestScore` cao nhất, chặn chưa ghi danh, chặn nộp trùng) và đồng bộ lại stub/tên hàm trong `backend/test/learningService.test.js`, `backend/test/questionService.test.js`.
- Đánh giá: Đủ cho các trường hợp nghiệp vụ chính và điều kiện biên của `QuizService.start()` / `submit()`.
- Đã chỉnh sửa gì: Bổ sung 4 test case vào `backend/test/quizService.test.js` (gắn tag `// AI-assisted [AI-05, AI-10]` tại thời điểm commit) và cập nhật `backend/test/learningService.test.js`, `backend/test/questionService.test.js`.
- Cách kiểm chứng: Chạy `node --test test/quizService.test.js` tại `backend` (7/7 test đạt).
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%.
- Điều học được: Cần kiểm thử cả các trường hợp biên như chưa ghi danh, hết lượt và nộp trùng để bảo vệ tính toàn vẹn nghiệp vụ thi trắc nghiệm; khi tách nhánh test cũng cần cập nhật kịp thời mock của các module thay đổi chữ ký hàm.
