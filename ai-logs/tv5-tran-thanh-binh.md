## [AI-07] Sinh bộ Test Case cho chức năng HT-06 (Làm bài trắc nghiệm)
- **Công cụ AI:** Gemini
- **Prompt sử dụng:** Tạo 5 test case cho chức năng HT-06 (làm bài trắc nghiệm: nộp trễ, hết lượt, bỏ trống câu) theo bảng 6 cột.
- **Phần đã chỉnh sửa / loại bỏ:**
  - Loại bỏ các gợi ý ngoài phạm vi đặc tả (câu hỏi nhiều đáp án, chấm tự luận, khóa trình duyệt chống gian lận).
  - Bổ sung `TC-08` kiểm tra API không gửi đáp án đúng xuống trình duyệt trước khi nộp theo đúng tiêu chí `HT-NFR1`.
  - Chuẩn hóa lại ID (`TC-04` -> `TC-08`) và trạng thái `Pending` để khớp với `docs/test-cases.md`.