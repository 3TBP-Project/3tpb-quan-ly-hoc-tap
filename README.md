# 3tbp-quan-ly-hoc-tap
## Hướng dẫn Quản lý Cơ sở Dữ liệu (Knex.js)

Dự án sử dụng **Knex.js** làm công cụ quản lý Migration (khởi tạo cấu trúc bảng) và Seed (nạp dữ liệu mẫu) kết nối với cơ sở dữ liệu **MySQL**.

---

### 1. Cài đặt môi trường

Trước khi chạy các lệnh database, đảm bảo dự án đã được cài đặt đầy đủ các thư viện:

```bash
npm install knex mysql2 dotenv