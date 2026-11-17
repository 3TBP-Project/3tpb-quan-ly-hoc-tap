### [AI-01] Kết nối cơ sở dữ liệu
- Ngày / Người dùng: 2026-11-11 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: Commit chore :cau hinh ket noi csdl
- Mục đích:Kết nối csdl
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
- Kết quả AI trả về (tóm tắt): 
- Đánh giá: Đủ
- Đã chỉnh sửa gì: Không điều chỉnh gì cả
- Cách kiểm chứng: test nào, đối chiếu tài liệu nào
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Biết được cách cấu hình kết nối csdl

### [AI-02] Xây dựng chức năng đăng ký và băm mật khẩu (HT-03)
- Ngày / Người dùng: 2026-11-12 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: HT-03
- Mục đích: Tìm hiểu cơ chế băm mật khẩu an toàn với `bcrypt` và sinh mã mẫu luồng Đăng ký
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Tạo chức năng đăng ký và băm mật khẩu
- Kết quả AI trả về (tóm tắt): Cung cấp mã nguồn 3 lớp kèm logic kiểm tra đầu vào tiếng Việt, chặn trùng email, ép vai trò mặc định `student` khi đăng ký và cấp JWT token khi đăng nhập.
- Đánh giá: Thiếu
- Đã chỉnh sửa gì: Sửa lại tên một số trường dữ liệu và câu lệnh SQL `SELECT`/`INSERT` trong `userRepository.js` và `authService.js` từ `full_name`, `password_hash` thành `name`, `password` cho khớp với CSDL MySQL của nhóm.
- Cách kiểm chứng: test nào, đối chiếu tài liệu nào
- Tỷ lệ mã AI còn giữ lại (ước lượng): 90%
- Điều học được: Hiểu thêm được phần băm mật khẩu `bcrypt` 

### [AI-03] Xây dựng chức năng đăng nhập và phân quyền 3 vai trò (HT-03)
- Ngày / Người dùng: 2026-11-12 / Nguyễn Quang Thông
- Công cụ: Gemini
- Giai đoạn: Lập trình
- Task / Commit / PR: HT-03
- Mục đích: Xây dựng luồng đăng nhập bằng email/mật khẩu, phát hành JWT và giới hạn truy cập theo ba vai trò `student`, `teacher`, `admin`.
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): Tạo chức năng đăng nhập và phân quyền 3 vai trò
- Kết quả AI trả về (tóm tắt): Đăng nhập tìm tài khoản, đối chiếu mật khẩu đã băm bằng `bcrypt`, từ chối tài khoản bị khóa, sau đó cấp JWT có thời hạn 1 ngày và trả đường dẫn điều hướng theo vai trò. Middleware xác minh JWT và kiểm tra quyền trước khi cho truy cập các route dashboard.
- Đánh giá: Đủ vì đã đáp ứng đủ các yêu cầu đặt ra.
- Đã chỉnh sửa gì: Điều chỉnh truy vấn repository để khớp tên cột mật khẩu thực tế trong MySQL.Đã thử gọi API đăng nhập và route dashboard bằng PowerShell.
- Tỷ lệ mã AI còn giữ lại (ước lượng): 98%
- Điều học được: Hiểu cách dùng JWT để xác thực request và middleware để kiểm tra vai trò; cần đối chiếu tên cột với schema thực tế trước khi kiểm thử luồng đăng nhập.

### [AI-04] 