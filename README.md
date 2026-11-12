# 3tbp-quan-ly-hoc-tap
# 3TPB - Hệ Thống Quản Lý Học Tập Trực Tuyến (LMS)

Ứng dụng web hỗ trợ quản lý khóa học, phân phối bài giảng và tổ chức thi trắc nghiệm trực tuyến cho ba nhóm người dùng: **Quản trị viên (Admin)**, **Giảng viên (Instructor)** và **Học viên (Student)**.

---

## 1. Tính năng chính

- **Chung & Xác thực:** Đăng ký tài khoản học viên (`HT-03`), đăng nhập/đăng xuất với phân quyền JWT (`HT-04`), xem danh sách và chi tiết khóa học công khai.
- **Học viên:** Ghi danh vào khóa học, theo dõi tiến độ học tập, làm bài kiểm tra trắc nghiệm có giới hạn thời gian (`HT-06` - tối đa 3 lượt làm, chấm tự động và tính điểm cao nhất), xem lịch sử điểm số.
- **Giảng viên:** Tạo và quản lý khóa học của mình, biên soạn nội dung bài học, tạo ngân hàng câu hỏi trắc nghiệm (4 lựa chọn, 1 đáp án đúng) và theo dõi kết quả học viên.
- **Quản trị viên:** Quản lý tài khoản người dùng (phân quyền, khóa/mở khóa tài khoản), kiểm duyệt khóa học và thống kê tổng quan hệ thống.

---

## 2. Công nghệ sử dụng

- **Frontend:** React, Vite, Axios, CSS / Tailwind CSS
- **Backend:** Node.js, Express.js, JWT (JSON Web Token), Bcrypt
- **Cơ sở dữ liệu:** MySQL 8.0+ (hoặc PostgreSQL tương ứng cấu hình)
- **Công cụ quản lý & kiểm thử:** Git, GitHub, VS Code, Thunder Client

---

## 3. Cấu trúc thư mục

```text
3tpb-quan-ly-hoc-tap/
├── .github/                  # Mẫu Pull Request và cấu hình repository
├── ai-logs/                  # Nhật ký sử dụng AI của từng thành viên (TV1 -> TV5)
├── backend/                  # Mã nguồn RESTful API (Node.js / Express)
│   ├── database/             # Script SQL migration (tạo bảng) và seed (dữ liệu mẫu)
│   ├── src/                  # Controllers, Middlewares, Models, Routes, Utils
│   ├── .env.example          # Tệp mẫu biến môi trường Backend
│   └── package.json
├── frontend/                 # Mã nguồn giao diện người dùng (React / Vite)
│   ├── src/                  # Components, Pages, Services, Utils
│   ├── .env.example          # Tệp mẫu biến môi trường Frontend
│   └── package.json
├── docs/                     # Tài liệu kỹ thuật & kiểm thử
│   ├── cau-truc-thu-muc.md   # Mô tả chi tiết cây thư mục dự án
│   └── test-cases.md         # Bảng kịch bản kiểm thử chức năng & phi chức năng
├── .gitignore
└── README.md
```

Xem chi tiết chức năng từng thư mục tại: [`docs/cau-truc-thu-muc.md`](docs/cau-truc-thu-muc.md).

---

## 4. Yêu cầu môi trường

Đảm bảo máy tính đã cài đặt sẵn các công cụ sau trước khi bắt đầu:

- **Node.js:** phiên bản `>= 18.x` (đi kèm `npm`)
- **Hệ quản trị CSDL:** MySQL `>= 8.0` (hoặc XAMPP / Laragon / Docker)
- **Git**

---

## 5. Hướng dẫn cài đặt & Khởi chạy

### Bước 1: Clone repository và chuyển sang nhánh `develop`

```bash
git clone [https://github.com/3TBP-Project/3tpb-quan-ly-hoc-tap.git](https://github.com/3TBP-Project/3tpb-quan-ly-hoc-tap.git)
cd 3tpb-quan-ly-hoc-tap
git checkout develop
```

### Bước 2: Cài đặt và chạy Backend

1. Di chuyển vào thư mục `backend` và cài đặt thư viện:
   ```bash
   cd backend
   npm install
   ```

2. Tạo tệp cấu hình `.env` từ tệp mẫu `.env.example`:
   - **Trên Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
   - **Trên Git Bash / macOS / Linux:**
     ```bash
     cp .env.example .env
     ```
   *Mở tệp `backend/.env` và cập nhật thông tin kết nối CSDL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=lms_db`) phù hợp với máy của bạn.*

3. Khởi tạo Cơ sở dữ liệu (Migration & Seed dữ liệu mẫu):
   - **Cách 1 (Chạy bằng lệnh npm nếu dự án đã cấu hình script):**
     ```bash
     npm run migrate
     npm run seed
     ```
   - **Cách 2 (Import trực tiếp file SQL thủ công):**
     Tạo một CSDL trống tên `lms_db` trên MySQL Workbench / phpMyAdmin, sau đó chạy lần lượt tệp `backend/database/migration.sql` (tạo bảng) và `backend/database/seed.sql` (nạp dữ liệu mẫu).

4. Khởi động máy chủ Backend:
   ```bash
   npm run dev
   ```
   > Máy chủ API sẽ hoạt động tại địa chỉ: **`http://localhost:5000`**

### Bước 3: Cài đặt và chạy Frontend

Mở một cửa sổ **Terminal mới** tại thư mục gốc của dự án (`3tpb-quan-ly-hoc-tap`):

1. Di chuyển vào thư mục `frontend` và cài đặt thư viện:
   ```bash
   cd frontend
   npm install
   ```

2. Tạo tệp cấu hình `.env` từ tệp mẫu:
   - **Trên Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
   - **Trên Git Bash / macOS / Linux:**
     ```bash
     cp .env.example .env
     ```
   *(Đảm bảo biến `VITE_API_URL=http://localhost:5000/api` khớp với cổng của Backend).*

3. Khởi động giao diện người dùng:
   ```bash
   npm run dev
   ```
   > Mở trình duyệt và truy cập vào địa chỉ: **`http://localhost:5173`**

---

## 6. Tài khoản Demo mặc định

Sau khi chạy bước **Seed dữ liệu mẫu**, hệ thống cung cấp sẵn 3 tài khoản tương ứng với 3 vai trò để đăng nhập và kiểm thử ngay *(đây là tài khoản mẫu phục vụ môi trường phát triển)*:

| Vai trò | Email đăng nhập | Mật khẩu mẫu | Phạm vi kiểm thử |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@lms.edu.vn` | `Admin@123` | Quản lý người dùng, duyệt/khóa khóa học, thống kê |
| **Giảng viên (Instructor)** | `giangvien1@lms.edu.vn` | `Teacher@123` | Tạo khóa học, thêm bài giảng, tạo đề trắc nghiệm |
| **Học viên (Student)** | `hocvien1@lms.edu.vn` | `Student@123` | Ghi danh khóa học, học bài, làm bài trắc nghiệm (`HT-06`) |

---

## 7. Tài liệu kiểm thử & Nhật ký AI

- **Kịch bản kiểm thử (Test Cases):** [`docs/test-cases.md`](docs/test-cases.md) — Bao gồm danh sách test case chức năng và phi chức năng theo bảng chuẩn 6 cột.
- **Nhật ký sử dụng AI (AI Logs):** Thư mục [`ai-logs/`](ai-logs/) — Lưu trữ prompt, kết quả tham khảo và phần hiệu chỉnh thực tế của từng thành viên (`tv1` đến `tv5`).

---

## 8. Quy ước làm việc nhóm

- **Quản lý nhánh:** Tách nhánh tính năng/tài liệu từ `develop` (`feature/...`, `fix/...`, `docs/...`), không push trực tiếp lên `main` hoặc `develop`.
- **Commit Message:** Tuân thủ chuẩn Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) và gắn trailer `AI-assisted` nếu có sử dụng AI hỗ trợ.
- **Pull Request:** Điền đầy đủ 5 mục trong mẫu PR, chạy thử thực tế trên máy trước khi bấm **Approve** và gán Reviewer kiểm tra chéo.