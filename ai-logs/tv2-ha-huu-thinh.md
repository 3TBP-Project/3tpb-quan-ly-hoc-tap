### [AI-001] Tạo Bảng Cơ Sở Dữ Liệu
- Người dùng: Hà Hữu Thịnh
- Công cụ: Gemini - Model Free
- Giai đoạn - Thời Gian: 
Thiết kế cơ sở dữ liệu
Ngày 9/Tháng 10/Năm 2026
- Task: 
- Mục đích: Tạo các bảng bao gồm: users, categories, courses, lessons, enrollments, lesson_progress,
questions, quiz_attempts; thuộc tính và quan hệ. Tất cả được thể hiện thành code và xuất qua trang dbdiagram.io
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):"Tôi muốn bạn liệt kê các bảng users, categories, courses, lessons, enrollments, lesson_progress,questions, quiz_attempts; 
Theo các yêu cầu sau:
- Liệt kê các thuộc tính và quan hệ.
- Xuất thành code cho dbdigram
- Không cần cầu kỳ
- Cấm bịa thêm bất kỳ thông tin nào
- Chỉ liệt kê các bảng trên mà cấm có thêm các bảng ngoài luồng
- Chỉ rõ các thuộc tính và mối quan hệ
- Chỉ liệt kê các thuộc tính và giá trị cần thiết không cần thêm dài dòng"
- Kết quả AI trả về (tóm tắt): Đoạn mã
- Đánh giá: Đúng / Sai / Thiếu - vì sao
- Đã chỉnh sửa gì: Thêm các thuộc tính mới ở bảng Users và bảng lessons
- Cách kiểm chứng: test nào, đối chiếu tài liệu nào
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Nếu như không có danh sách bảng và thuộc tính cụ thể thì AI sẽ tự suy diễn theo yêu cầu và làm trong phạm vi promt
