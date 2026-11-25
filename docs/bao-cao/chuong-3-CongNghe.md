# CHƯƠNG 3. CÔNG NGHỆ SỬ DỤNG

Hệ thống **Website Quản lý học tập trực tuyến** được xây dựng theo kiến trúc tách biệt Frontend – Backend (Client – Server) và sử dụng hệ quản trị cơ sở dữ liệu quan hệ MySQL. Toàn bộ phiên bản công nghệ dưới đây được đối chiếu trực tiếp từ cấu hình dự án (`package.json`).

---

## 3.1. Công nghệ Backend

| Công nghệ / Thư viện | Phiên bản | Vai trò trong hệ thống |
|---|---|---|
| **Node.js & Express.js** | `^5.3.0` | Xây dựng RESTful API theo mô hình phân tầng (`Routes` → `Controllers` → `Services` → `Repositories`). |
| **MySQL2** | `^3.24.6` | Kết nối và thực thi truy vấn SQL bất đồng bộ thông qua Connection Pool với MySQL. |
| **JSON Web Token (`jsonwebtoken`)** | `^9.0.3` | Tạo và xác thực token JWT phục vụ đăng nhập và kiểm soát phân quyền theo 3 vai trò (`student`, `teacher`, `admin`). |
| **Bcrypt (`bcrypt`)** | `^6.0.0` | Băm mật khẩu một chiều trước khi lưu trữ vào cơ sở dữ liệu và đối chiếu khi đăng nhập. |
| **Multer (`multer`)** | `^2.5.0` | Xử lý tải lên tệp (`multipart/form-data`) cho ảnh đại diện, ảnh bìa khóa học và tài liệu PDF đính kèm bài học. |
| **CORS (`cors`)** | `^2.8.6` | Cấu hình cho phép Frontend giao tiếp với API Backend khác cổng/tên miền. |
| **Dotenv (`dotenv`)** | `^18.0.10` | Quản lý cấu hình nhạy cảm và biến môi trường (thông tin CSDL, `JWT_SECRET`, cổng chạy server). |
| **Nodemon (`nodemon`)** | `^3.1.11` | Tự động khởi động lại server Backend trong quá trình phát triển. |

---

## 3.2. Công nghệ Frontend

| Công nghệ / Thư viện | Phiên bản | Vai trò trong hệ thống |
|---|---|---|
| **React** | `^19.3.1` | Thư viện xây dựng giao diện người dùng theo mô hình thành phần (Component-based SPA). |
| **Vite** | `^8.3.6` | Công cụ đóng gói (bundler) và chạy môi trường phát triển với tốc độ khởi tạo và HMR nhanh. |
| **React Router DOM** | `^7.18.5` | Định tuyến phía trình duyệt và bảo vệ trang theo vai trò (`ProtectedRoute`). |
| **Bootstrap & React-Bootstrap** | `^5.3.8` / `^2.10.10` | Hệ thống lưới và thành phần giao diện đáp ứng (Responsive) trên cả máy tính và thiết bị di động. |
| **Axios** | `^1.21.1` | Gửi yêu cầu HTTP tới REST API, tự động đính kèm JWT token và xử lý lỗi phản hồi tập trung. |
| **React Hook Form & Yup** | `^7.92.0` / `^1.7.1` | Quản lý trạng thái biểu mẫu và kiểm tra tính hợp lệ dữ liệu đầu vào phía client (kết hợp `@hookform/resolvers ^7.0.6`). |
| **ESLint** | `^10.14.0` | Kiểm tra chuẩn mã nguồn và phát hiện lỗi cú pháp/quy ước JavaScript/React. |

---

## 3.3. Cơ sở dữ liệu & Công cụ thiết kế, quản lý

| Công nghệ / Công cụ | Phiên bản / Mục đích | Vai trò trong hệ thống |
|---|---|---|
| **MySQL** | `8.x` (`InnoDB`) | Lưu trữ dữ liệu quan hệ với bảng mã tiếng Việt (`utf8mb3_vietnamese_ci` / `utf8mb4`), đảm bảo toàn vẹn khóa ngoại và giao dịch (Transaction). |
| **Knex.js** | `^3.3.0` | Quản lý phiên bản lược đồ CSDL qua **14 file Migration** (`Database/migrations/`) và khởi tạo dữ liệu mẫu chuẩn hóa qua **Seed** (`Database/seeds/01_seed_data.js`). |
| **dbdiagram.io** | Công cụ trực tuyến | Thiết kế, chuẩn hóa và xuất sơ đồ thực thể kết hợp (ERD) bằng ngôn ngữ DBML. |
| **Git & GitHub** | Quản lý mã nguồn | Lưu trữ mã nguồn, phân nhánh theo tính năng/tài liệu (`develop`, `feat/...`, `fix/...`, `docs/...`) và rà soát Pull Request. |
| **Trello** | Quản lý tiến độ | Theo dõi trạng thái công việc của dự án theo bảng Kanban (`Cần làm`, `Đang làm`, `Lỗi`, `Hoàn thành`). |
