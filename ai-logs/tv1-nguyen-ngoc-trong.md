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
 ### [AI-01] Tạo Bảng Use Case cho dự án
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

### [AI-02] Tạo Squenche diagram cho chức năng làm bài trắc nghiệm
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - Sonnet 5.5 (High)
- Giai đoạn - Thời Gian: 
    + Thiết kế 
    + 12/11/2026>
- Task: 
vẽ sequence diagram “Làm bài trắc nghiệm”: Học viên → QuizController.start (tạo lượt, ghi giờ bắt đầu, trả câu hỏi không kèm đáp án) → submit (kiểm tra giờ, chấm, lưu điểm) (thẻ [DOC] Sequence diagram, nhánh docs/sequence)
- Mục đích: Hiểu luồng chạy chức năng làm bài tập trắc nghiệm (Đang làm và đã hoàn thành)
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):Rồi bây giờ bạn tạo squenche diagram cái chức năng Làm bài trắc nghiệm”: Học viên → QuizController.start (tạo lượt, ghi giờ bắt đầu, trả câu hỏi không kèm đáp án) → submit (kiểm tra giờ, chấm, lưu điểm)
- Kết quả AI trả về (tóm tắt):
Mình dựng một sơ đồ duy nhất bám đúng mô tả trong PDF Ngày 3. Tên hàm giữ nguyên QuizController.start và QuizController.submit như đề ghi.

Mình đã gửi đủ 3 file, sơ đồ đi đúng luồng PDF mô tả:

sequence-lam-bai-trac-nghiem.png: ảnh để dán vào slide. Lần gửi đầu bị lỗi vì ảnh cao quá 8000 px, mình đã xuất lại ở kích thước nhỏ hơn và gửi được.
sequence-lam-bai-trac-nghiem.md: commit file này vào docs/, mở trên GitHub là sơ đồ tự hiện. Cuối file có bảng chỉ ra 3 điểm thực hiện HT-NFR1.
sequence-lam-bai-trac-nghiem.mmd: mã nguồn. Muốn sửa thì dán vào mermaid.live, hoặc trong draw.io chọn Bổ sung → Mermaid.

Mình đã kiểm tra cú pháp bằng trình đọc của Mermaid và tự xuất ảnh ra xem: sơ đồ hiển thị đúng, tiếng Việt có dấu không bị lỗi.

Commit theo đúng việc N3-TV1-01:

powershell
git checkout develop
git pull origin develop
git checkout -b docs/sequence
git add docs/sequence-lam-bai-trac-nghiem.md docs/sequence-lam-bai-trac-nghiem.mmd docs/sequence-lam-bai-trac-nghiem.png
git commit -m "docs: sequence diagram lam bai trac nghiem"
git push -u origin docs/sequence

Khi bảo vệ, chỉ vào 3 bước trên sơ đồ. Đây là 3 bước PDF yêu cầu:

Bước 22: server tự ghi started_at.
Bước 30: server xóa correct_option trước khi gửi câu hỏi xuống.
Bước 49 và 60: server tự tính thời gian đã làm và tự chấm điểm.

Đồng hồ đếm ngược ở bước 33 chỉ để học viên nhìn. Nếu GV hỏi “học viên sửa đồng hồ trên máy thì sao”, câu trả lời là server không dùng giờ của trình duyệt.

Việc còn lại là N3-TV1-02: đối chiếu tên hàm và tên cột với code của TV2. Tên QuizController.start và QuizController.submit mình giữ đúng như PDF ghi. Còn các tên findByIdWithCourse, findAnswerKey, findBestScore là mình tự đặt theo kiểu thường dùng, nên cần hỏi TV2 xem code thật đặt tên gì. Cột thời gian làm bài phải là quiz_minutes, khớp bản migration mình sửa lúc nãy. Nếu TV4 vẫn để quiz_duration thì hai bên sẽ lệch tên cột.
- Đánh giá: Sai (Chưa có hàm hay các trường hợp lỗi 404)
- Đã chỉnh sửa gì: Vẽ mọi thứ ở mức tổng quan
- Cách kiểm chứng: 
https://viblo.asia/p/so-do-sequence-diagram-tat-tan-tat-thong-tin-quan-trong-ban-can-nam-WR5JRBjAJGv
- Điều học được: Không cần tạo squenche quá phức tạp chỉ cần tạo để giải thích được luồng chạy của chức năng