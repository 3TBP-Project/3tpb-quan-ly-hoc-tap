# Mẫu Test Case - Dự án Quản lý học tập

| ID | Mã chức năng | Bước | Dữ liệu | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC-01 | HT-04 | 1. Đăng nhập học viên<br>2. Nhấn nút "Ghi danh" | Tài khoản học viên hợp lệ | Ghi danh thành công, hiển thị khóa học trong "Khóa học của tôi" với tiến độ 0% | Pass |
| TC-02 | HT-11 | 1. Đăng nhập giảng viên<br>2. Thêm câu hỏi trắc nghiệm | Nội dung câu hỏi, 4 đáp án, thời gian 15 phút | Thêm thành công, lưu đúng thời gian làm bài | Pass |
| TC-03 | HT-13 | 1. Đăng nhập giảng viên<br>2. Tải tệp CSV câu hỏi lên | Tệp `questions.csv` (dòng 4 thiếu đáp án) | Nhập các câu hợp lệ, báo lỗi chi tiết ở dòng 4 | Pass |