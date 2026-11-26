# Hướng dẫn Thiết lập, Migration & Seeder Cơ sở dữ liệu (Node.js + MySQL)

Tài liệu này hướng dẫn đầy đủ các bước thiết lập kết nối, chạy **Migration** (14 file tạo/cập nhật 12 bảng dữ liệu) và tạo/chạy **Seeder** (dữ liệu mẫu & dữ liệu demo chạy lại được) cho hệ thống **Quản lý học tập trực tuyến (`db_quanlyhoctap`)**.

---

## 1. Liên kết dự án & Thành viên nhóm

* **Repository GitHub:** https://github.com/3TBP-Project/3tpb-quan-ly-hoc-tap
* **Bảng quản lý tiến độ (Trello):** https://trello.com/b/g7hXkb8I/3tpb-quan-ly-hoc-tap-web-2026
* **Video demo sản phẩm:** 

| Mã | Họ và tên | Vai trò |
|---|---|---|
| TV1 | Nguyễn Ngọc Trọng | Leader (LE) |
| TV2 | Nguyễn Quang Thông | Backend 1 (BE1) |
| TV3 | Lê Đức Phong | Frontend (FE) |
| TV4 | Hà Hữu Thịnh | Backend 2 (BE2) |
| TV5 | Trần Thanh Bình | Git & Tester (GT) |

---

## 2. Công nghệ sử dụng & Cấu trúc thư mục

* **Frontend:** React (Vite), React Router, CSS Modules / Tailwind CSS (`frontend/`)
* **Backend:** Node.js, Express 5, JSON Web Token (`jsonwebtoken`), `bcrypt` (`backend/`)
* **Cơ sở dữ liệu:** MySQL 8.0+, Knex.js Migration & Seed (`Database/`)
* **Kiểm thử:** `node:test` và `node:assert/strict` tích hợp sẵn trong Node.js (`backend/test/`)

```text
3tpb-quan-ly-hoc-tap/
├── backend/          # API Server (Node.js + Express) và bộ Unit Test
├── frontend/         # Giao diện người dùng (React + Vite)
├── Database/         # Cấu hình Knex, Migrations (8 bảng) và Seeds dữ liệu mẫu
├── docs/             # Tài liệu phân tích, thiết kế, test-cases.md và báo cáo
├── ai-logs/          # Nhật ký sử dụng AI của 5 thành viên
├── .env.example      # Tệp mẫu biến môi trường
└── README.md         # Hướng dẫn cài đặt và vận hành hệ thống

*(Nếu khởi tạo mới từ đầu, chạy lần lượt: `npm init -y`, `npm install knex mysql2 dotenv`, `npx knex init`).*
```
---

## 3. Hướng dẫn cài đặt và chạy trên máy sạch (≤ 15 phút)
Yêu cầu môi trường
Node.js phiên bản >= 20.x và npm >= 10.x

MySQL Server phiên bản 8.0+ (hoặc XAMPP / Laragon / Docker MySQL đang chạy)

Bước 1: Clone mã nguồn: 
git clone https://github.com/3TBP-Project/3tpb-quan-ly-hoc-tap.git
cd 3tpb-quan-ly-hoc-tap

Bước 2: Cấu hình biến môi trường (.env)
1. Sao chép tệp mẫu cấu hình cho Backend và Frontend:
cp .env.example backend/.env
cp frontend/.env.example frontend/.env

2. Mở tệp backend/.env và cập nhật thông tin kết nối MySQL của bạn:
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_quanlyhoctap
JWT_SECRET=chuoi_bi_mat_lms_3tpb_2026
JWT_EXPIRES_IN=1d

Bước 3: Khởi tạo CSDL, chạy Migration và Seed dữ liệu mẫu
1. Mở MySQL (phpMyAdmin / MySQL Workbench / MySQL CLI) và tạo database rỗng khớp với DB_NAME:
CREATE DATABASE IF NOT EXISTS db_quanlyhoctap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
2. Di chuyển vào thư mục Database, cài đặt thư viện (knex, mysql2, dotenv) và đồng bộ cấu trúc 8 bảng cùng dữ liệu mẫu:
cd Database
npm install
npx knex migrate:latest
npx knex seed:run
cd ..
Các lệnh quản lý Migration bổ sung (chạy trong thư mục Database/):
# Kiểm tra trạng thái các file Migration
npx knex migrate:status

# Hoàn tác (Rollback) lần chạy Migration gần nhất
npx knex migrate:rollback

# Hoàn tác toàn bộ các bảng đã tạo
npx knex migrate:rollback --all

Bước 4: Cài đặt thư viện và khởi chạy Backend & Frontend
Mở Terminal 1 — Khởi chạy Backend (cổng 5000):
cd backend
npm install
npm run dev

Mở Terminal 2 — Khởi chạy Frontend (cổng 5173):
cd frontend
npm install
npm run dev

---

## 4. Hướng dẫn chạy kiểm thử (Unit Test)
Bộ kiểm thử đơn vị sử dụng node --test tích hợp sẵn của Node.js:
cd backend
npm test

---

## 5. Tài khoản demo 3 vai trò
Sau khi chạy xong npx knex seed:run ở Bước 3, có thể đăng nhập trực tiếp để kiểm tra đầy đủ 3 phân hệ:
## Tài khoản demo 3 vai trò

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng kiểm thử tiêu biểu |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@gmail.com` | `12345678` | Tạo tài khoản giảng viên, khóa/mở tài khoản người dùng, quản lý danh mục, duyệt/ẩn khóa học |
| **Giảng viên (Teacher)** | `teacher1@gmail.com` | `12345678` | Tạo/sửa/xóa khóa học của mình, quản lý chương & bài học, soạn câu hỏi trắc nghiệm, nhập CSV |
| **Học viên (Student)** | `student1@gmail.com` | `12345678` | Duyệt/tìm khóa học, ghi danh, học bài & lưu tiến độ, làm bài trắc nghiệm (tối đa 3 lượt), sửa hồ sơ |
