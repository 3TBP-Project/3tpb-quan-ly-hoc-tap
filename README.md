# Hướng dẫn Thiết lập, Migration & Seeder Cơ sở dữ liệu (Node.js + MySQL)

Tài liệu này hướng dẫn đầy đủ các bước thiết lập kết nối, chạy **Migration** (14 file tạo/cập nhật 12 bảng dữ liệu) và tạo/chạy **Seeder** (dữ liệu mẫu & dữ liệu demo chạy lại được) cho hệ thống **Quản lý học tập trực tuyến (`db_quanlyhoctap`)**.

---

## 1. Khởi tạo Dự án & Cài đặt Thư viện

Mở terminal tại thư mục `Database` (`cd Database`) và cài đặt các thư viện cần thiết:

```bash
# Cài đặt thư viện từ package.json sẵn có
npm install
```

*(Nếu khởi tạo mới từ đầu, chạy lần lượt: `npm init -y`, `npm install knex mysql2 dotenv`, `npx knex init`).*

---

## 2. Cấu hình Môi trường & Kết nối

### Bước 1: Tạo file `.env`
Tạo file `.env` trong thư mục `Database/.env` (hoặc dùng chung `backend/.env`) và khai báo thông tin kết nối MySQL:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_cua_ban
DB_NAME=db_quanlyhoctap
```

Nếu `Database/.env` chưa tồn tại, `knexfile.js` sẽ tự động đọc cấu hình từ `backend/.env`.

### Bước 2: Cấu hình `Database/knexfile.js`
Đảm bảo `Database/knexfile.js` đã khai báo đủ cả `migrations` và `seeds`:

```javascript
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', 'backend', '.env') });

/** @type { Object.<string, import("knex").Knex.Config> } */
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'db_quanlyhoctap'
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
```

---

## 3. Các lệnh Thực thi & Quản lý Migration

Chạy tại thư mục `Database`:

```bash
# Chạy toàn bộ Migration để tạo/cập nhật bảng trên MySQL
npx knex migrate:latest

# Kiểm tra trạng thái các file Migration
npx knex migrate:status

# Hoàn tác (Rollback) lần chạy Migration gần nhất
npx knex migrate:rollback

# Hoàn tác toàn bộ các bảng đã tạo
npx knex migrate:rollback --all
```

---

## 4. Tạo & Chạy Seeder (Dữ liệu mẫu & Dữ liệu Demo)

### 4.1. Tạo một file Seeder mới
Để tạo thêm file seeder mới trong thư mục `Database/seeds/`:

```bash
npx knex seed:make <ten_file_seed>
# Ví dụ:
npx knex seed:make 03_seed_custom
```

### 4.2. Chạy toàn bộ bộ Seeder sẵn có
Lệnh dưới đây sẽ chạy lần lượt tất cả các file seeder trong `Database/seeds/` theo thứ tự bảng chữ cái (`01_seed_data.js` → `02_seed_demo.js`):

```bash
npx knex seed:run
```

### 4.3. Chạy riêng 1 file Seeder cụ thể
Nếu chỉ muốn chạy một file seeder nhất định (không chạy các file khác):

```bash
# Chỉ chạy bộ dữ liệu mẫu đầy đủ (8 khóa học, 19 tài khoản)
npx knex seed:run --specific=01_seed_data.js

# Chỉ chạy bộ dữ liệu demo gọn nhẹ (2 khóa học đầy đủ bài học + câu hỏi, 3 tài khoản 3 vai trò)
npx knex seed:run --specific=02_seed_demo.js
```

> **Lưu ý:** Cả hai file seeder đều được thiết kế **chạy lại được nhiều lần (idempotent)** — có thể chạy lại `npx knex seed:run` bất cứ lúc nào để làm sạch và khôi phục dữ liệu mẫu/demo mà không gây lỗi trùng khóa.

### 4.4. Danh sách các bộ Seeder sẵn có trong `Database/seeds/`

| File Seeder | Nội dung dữ liệu tạo ra |
|---|---|
| `01_seed_data.js` | 5 danh mục, 19 người dùng (1 admin, 3 giảng viên, 15 học viên), 8 khóa học, 24 chương, 40 bài học, 80 câu hỏi, dữ liệu ghi danh, tiến độ, lượt làm bài, bình luận & thảo luận mẫu. |
| `02_seed_demo.js` | Dữ liệu demo chuẩn: **3 tài khoản cho 3 vai trò** + **2 khóa học công khai** đầy đủ chương, bài học (kèm link YouTube) và 10 câu hỏi trắc nghiệm/khóa, ghi danh sẵn cho học viên demo. |

### 4.5. Tài khoản Demo 3 vai trò (Mật khẩu chung: `12345678`)

| Vai trò | Bộ `01_seed_data.js` | Bộ `02_seed_demo.js` |
|---|---|---|
| **Quản trị viên (`admin`)** | `admin@gmail.com` | `admin.demo@gmail.com` |
| **Giảng viên (`teacher`)** | `teacher1@gmail.com`, `teacher2@gmail.com`, `teacher3@gmail.com` | `teacher.demo@gmail.com` |
| **Học viên (`student`)** | `student1@gmail.com` … `student15@gmail.com` | `student.demo@gmail.com` |
