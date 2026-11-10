### [AI-001] Tạo Bảng Cơ Sở Dữ Liệu
- Người dùng: Hà Hữu Thịnh
- Công cụ: Gemini - Model Free
- Giai đoạn - Thời Gian: 
Thiết kế cơ sở dữ liệu
Ngày 9/Tháng 11/Năm 2026
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
- Đánh giá:Thiếu - Do là không cung cấp đủ thông tin cần thiết
- Đã chỉnh sửa gì: Thêm các thuộc tính mới ở bảng Users và bảng lessons
- Cách kiểm chứng: Đối chiếu với các bài học cũ và thể hiện qua dbdiagram.io
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Nếu như không có danh sách bảng và thuộc tính cụ thể thì AI sẽ tự suy diễn theo yêu cầu và làm trong phạm vi promt
### [AI-002] Chỉnh sửa ERD theo chuẩn 3NF và thiết lập các khóa ngoại(ERD-V2)
- Người dùng: Hà Hữu Thịnh
- Công cụ: Gemini - Model Free
- Giai đoạn - Thời Gian: 
Thiết kế cơ sở dữ liệu
Ngày 10/Tháng 11/Năm 2026
- Task: 
- Mục đích: Tìm hiểu về chuẩn 3NF và chỉnh sửa lại bảng ERD mới thiết lập các khóa ngoại 
Prompt chính:"Tiếp theo là về vấn đề Chuẩn hóa ERD bản 2 đạt chuẩn 3NF và thiết lập các khóa ngoại.
Tôi cần được giải thích 3NF là gì và ta cần có thêm thay đổi gì ở Database này hay không?"
Kết quả AI trả về (tóm tắt): Phần giải thích và mã mới xây dựng lại theo chuẩn 3NF
 Đánh giá: Đúng
- Cách kiểm chứng: Đối chiếu qua "https://datapot.edu.vn/kien-thuc/chuan-hoa-du-lieu-la-gi-1nf-2nf-3nf-datapot"
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Dù có trả về kết quả đúng nhưng về vấn đề thông tin thì cần phải được đối chiếu qua các nguồn chính thống khác nhau chứ không thể tin tưởng hoàn toàn vào AI

### [AI-003] Viết mo-ta-bang.md
- Người dùng: Hà Hữu Thịnh
- Công cụ: Gemini - Model Free
- Giai đoạn - Thời Gian: 
Thiết kế cơ sở dữ liệu
Ngày 10/Tháng 11/Năm 2026
- Task: 
- Mục đích: Hỗ trợ tạo file và viết phần mo-ta-bang.md dựa theo ERD mới nhất 
Prompt chính:"Tôi muốn bạn viết mo-ta-bang.md dựa theo file đính kèm này nhưng với các yêu cầu sau:
+ Đầy đủ mọi thông tin cần thiết
+ Có đủ khóa chính và khóa ngoại
+ Mô tả mỗi bảng
+ Có phần mô tả mục đích của các bảng
+ Lời nói đầu về mục đích file .md
+ Có các chú thích cho từng bảng"
Kết quả AI trả về (tóm tắt): Trả về một file định dạng .md và có nội dung
 Đánh giá: Đúng
- Cách kiểm chứng: Đã được đọc và kiểm tra lại dựa theo erd-v2.png mới nhất và theo file 01_Dac_ta_yeu_cau_6_de_tai.pdf được cung cấp từ trước ở "https://drive.google.com/drive/folders/1PQ5omU9Y1DSEiVCQXVxwBExFXSE5SL1B"
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Nếu được cung cấp đầy đủ thì AI sẽ cho kết quả trả lời đầy đủ nhưng về vấn đề ngôn ngữ thì sẽ có lúc AI sử dụng từ tiếng anh, trung hay những ngôn ngữ khác xen lẫn câu từ nếu không đọc kỹ và đặt quy tắc thì sẽ không phát hiện được lỗi