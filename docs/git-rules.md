# Quy tắc Git Dự án (Git Guidelines)

## 1. Mô hình nhánh (Branching Model)
- `main`: Branch sản phẩm chính (Production), tuyệt đối không push trực tiếp.
- `develop`: Branch tích hợp mã nguồn trước khi kiểm thử/release.
- `feature/HT-xx-mo-ta`: Nhánh phát triển tính năng mới (Ví dụ: `feature/HT-04-quan-ly-bai-hoc`).
- `fix/HT-xx-mo-ta`: Nhánh sửa lỗi (Ví dụ: `fix/HT-06-loi-cham-diem`).
- `test/HT-xx`: Nhánh bổ sung kiểm thử cho một chức năng (Ví dụ: `test/HT-06`).
- `docs/mo-ta`: Nhánh cập nhật tài liệu (Ví dụ: `docs/git-rules`).

*Lưu ý: Mã chức năng trong tên nhánh bắt buộc phải dùng dấu gạch ngang (`HT-xx`).*

## 2. Quy định Format Commit
Cấu trúc commit bắt buộc: `<loại>(<mã>): mô tả`

- **Các loại (`type`) hợp lệ:**
  - `feat`: Thêm tính năng mới
  - `fix`: Sửa lỗi
  - `refactor`: Tái cấu trúc code (không đổi logic/tính năng)
  - `test`: Thêm hoặc sửa test case
  - `docs`: Cập nhật tài liệu
  - `chore`: Cập nhật cấu hình build, package, môi trường

- **Nghiêm cấm:** CẤM tuyệt đối việc viết commit vô nghĩa hoặc ngắn ngủn như: `update`, `aaa`, `final`, `fixbug`.

- **Ví dụ đúng:** `feat(HT-04): thêm API tạo bài học mới`

## 3. Trailer AI
Khi sử dụng AI (ChatGPT, Claude, Copilot,...) hỗ trợ tạo hoặc refactor đoạn code/tài liệu, bắt buộc phải khai báo trailer trong commit message bằng cú pháp:

```bash
git commit -m "docs: quy tac git va mau PR" -m "AI-assisted: ChatGPT [AI-05]"
```

Mỗi lần dùng AI phải ghi vào `ai-logs/<thành viên>.md` trước khi commit phần liên quan.

## 4. Pull Request
- Không commit thẳng vào `main` và `develop`; mọi thay đổi đi qua Pull Request.
- `main` chỉ nhận PR từ `develop` để gắn tag phiên bản (`v0.1`, `v0.5`, `v1.0`).
- Mỗi PR dùng mẫu `.github/pull_request_template.md`: mô tả thay đổi, thẻ Trello / mã chức năng, mã AI log, cách đã kiểm chứng (test, chạy thử), ảnh giao diện nếu có.
- PR cần ít nhất 1 thành viên khác review trước khi merge.
- Trước khi tạo nhánh và trước khi mở PR: `git fetch --all --prune`, kéo `develop` mới nhất về nhánh của mình và kiểm tra `git status`.
