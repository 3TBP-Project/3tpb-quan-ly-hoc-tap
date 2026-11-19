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