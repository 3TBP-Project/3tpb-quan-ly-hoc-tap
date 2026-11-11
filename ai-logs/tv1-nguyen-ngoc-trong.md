<!-- Mẫu AI Logs
### [AI-<STT>] <Công việc anh em đang xử lý>
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: <Tên AI (Chatgpt)> - <Model(Sol6.1)>
- Giai đoạn - Thời Gian: 
<Thiết kế | Lập trình | Kiểm thử | Tài liệu>
<Ngày/Tháng/Năm>
- Task / Commit / PR: #23 / a1b2c3d / PR #15
- Mục đích: ...
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): ...
- Kết quả AI trả về (tóm tắt): ...
- Đánh giá: Đúng / Sai / Thiếu - vì sao
- Đã chỉnh sửa gì: ...
- Cách kiểm chứng: test nào, đối chiếu tài liệu nào
- Tỷ lệ mã AI còn giữ lại (ước lượng): ...%
- Điều học được: ..
 -->
 ### [AI-<STT>] Tạo Bảng Use Case cho dự án
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - (Opus 5 - Medium)
- Giai đoạn - Thời Gian: 
    - Thiết kế
    - 11/11/11
- Task: Tạo Use Case Cho dự án (Tham khảo từ bảng đặc tả)
- Mục đích: Kiểm Tra Xem Định dạng use case có đúng ko
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
Bạn coi thử xem mình cần cải thiện gì không
- Kết quả AI trả về (tóm tắt):
Ba lỗi lớn đã sửa xong: cụm "Quản Lý" tách đúng thành ba use case riêng, mũi tên kế thừa giờ chỉ đúng chiều xuống Khách vãng lai, và các đường association đã bỏ mũi tên. Giờ khoảng **88%**.

Còn sót đúng một lỗi thật:

## "Làm Bài Tập Trắc Nghiệm" vẫn chưa nối vào Học Viên

Ô này vẫn lơ lửng, không có đường nào. Đây là HT-06, một trong 12 chức năng bắt buộc, và là chức năng phức tạp nhất đồ án — GV mà thấy nó không nối với ai sẽ hỏi ngay.

Kéo một đường từ Học Viên sang ô đó là xong. Nhân tiện đổi tên thành **"Làm bài trắc nghiệm"** — Đặc tả không có chữ "Tập", và "bài tập" với "bài kiểm tra" là hai thứ khác nhau.

## Ba điểm đánh bóng

**Đầu mũi tên kế thừa** nên là tam giác rỗng, hiện đang là mũi tên nhọn thường. Trong draw.io: chọn đường đó → panel phải → mục Đường thẳng → đổi đầu mũi tên sang kiểu block rỗng (hình tam giác trắng viền đen).

**Viết hoa:** đang lẫn hai kiểu — "Quản Lý Khóa Học" viết hoa mọi chữ, còn "Quản lý người dùng" thì không. Chọn một. Mình khuyên theo Đặc tả: chỉ hoa chữ đầu.

**Khoảng trắng giữa sơ đồ** vẫn rất rộng. Kéo cụm Giảng Viên lên gần cụm Học Viên, cụm Quản Trị Viên lên gần cụm Khách vãng lai, rồi thu khung hệ thống lại. In A4 sẽ dễ nhìn hơn nhiều.

## Nhắc lại chỗ hôm trước

Bốn chức năng mức C (HT-08 Hỏi đáp, HT-12 Theo dõi học viên, HT-13 Nhập câu hỏi từ tệp, HT-16 Thống kê) vẫn chưa có. Nếu cố ý bỏ thì thêm một dòng chú thích dưới khung để GV biết đó là lựa chọn, không phải sót:

> *Sơ đồ thể hiện 12 chức năng bắt buộc (mức B). 4 chức năng mức C sẽ bổ sung sau Mốc 2.*

Nối xong HT-06 là sơ đồ đủ chuẩn để bảo vệ Mốc 1.
- Đánh giá: Đúng (Khoảng 80% - Vì còn một số thứ không cần thiết cho bảng use case)
- Đã chỉnh sửa gì: bảng use case chỉnh sửa cho đúng định dạng
- Cách kiểm chứng: Hình ảnh từ Google
- Điều học được: Xác định đúng định dạng bảng use case