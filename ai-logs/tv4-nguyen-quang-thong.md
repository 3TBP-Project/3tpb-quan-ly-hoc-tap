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