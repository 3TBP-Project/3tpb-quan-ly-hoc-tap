# Hướng dẫn Thiết lập & Chạy Migration Cơ sở dữ liệu (Node.js + MySQL)

Tài liệu này hướng dẫn đầy đủ các bước từ khởi tạo dự án, cài đặt thư viện, cấu hình kết nối đến tạo và chạy migration để đồng bộ hệ thống 8 bảng cơ sở dữ liệu lên MySQL.

---

## 1. Khởi tạo Dự án & Cài đặt Thư viện

Mở terminal tại thư mục gốc của dự án (`Database`) và chạy lần lượt các lệnh sau:

```bash
# Khởi tạo file package.json
npm init -y

# Cài đặt các thư viện cần thiết
npm install knex mysql2 dotenv

# Khởi tạo file cấu hình knexfile.js
npx knex init
```

---

## 2. Cấu hình Môi trường & Kết nối

### Bước 1: Tạo file `.env`
Tạo file `.env` ở thư mục gốc (`Database/.env`) và khai báo thông tin kết nối MySQL:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_cua_ban
DB_NAME=ten_database_cua_ban
```

Nếu `Database/.env` chưa tồn tại, cấu hình Knex sẽ dùng `backend/.env` để kết nối cùng cơ sở dữ liệu với backend.

### Bước 2: Cập nhật file `knexfile.js`
Mở file `knexfile.js` ở thư mục gốc và thay thế bằng nội dung sau:

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
    }
  }
};
```

---

## 3. Tạo các file Migration (Theo đúng thứ tự)

Chạy lần lượt các lệnh sau để tạo 8 file migration trong thư mục `./migrations/`:

```bash
npx knex migrate:make create_categories_table
npx knex migrate:make create_users_table
npx knex migrate:make create_courses_table
npx knex migrate:make create_enrollments_table
npx knex migrate:make create_lessons_table
npx knex migrate:make create_questions_table
npx knex migrate:make create_quiz_attempts_table
npx knex migrate:make create_lesson_progress_table
```

*(Sau khi tạo xong, copy nội dung định nghĩa từng bảng tương ứng vào các file vừa sinh ra).*

---

## 4. Các lệnh Thực thi & Quản lý Migration

### Chạy toàn bộ Migration để tạo bảng trên MySQL:
```bash
npx knex migrate:latest
```

### Kiểm tra trạng thái các file Migration:
```bash
npx knex migrate:status
```

### Hoàn tác (Rollback) lần chạy Migration gần nhất:
```bash
npx knex migrate:rollback
```

### Hoàn tác toàn bộ các bảng đã tạo:
```bash
npx knex migrate:rollback --all
```