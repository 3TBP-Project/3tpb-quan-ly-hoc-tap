# Cấu trúc thư mục dự án (`3tpb-quan-ly-hoc-tap`)

Tài liệu mô tả tổ chức mã nguồn, tài liệu kỹ thuật và nhật ký làm việc của hệ thống Quản lý Học tập trực tuyến.

## Cây thư mục tổng quan

```text
3tpb-quan-ly-hoc-tap/
├── .github/                  # Cấu hình GitHub (Pull Request template, Issue template)
├── ai-logs/                  # Nhật ký sử dụng AI của từng thành viên (TV1 -> TV5)
├── backend/                  # Mã nguồn máy chủ API (Node.js / Express)
│   ├── src/
│   │   ├── config/           # Cấu hình kết nối CSDL, biến môi trường
│   │   ├── controllers/      # Xử lý logic nghiệp vụ cho từng chức năng (HT-01 -> HT-13)
│   │   ├── middlewares/      # Xác thực JWT, phân quyền (Admin, Giảng viên, Học viên), xử lý lỗi
│   │   ├── models/           # Định nghĩa cấu trúc dữ liệu / truy vấn CSDL
│   │   ├── routes/           # Khai báo các tuyến đường RESTful API
│   │   └── utils/            # Các hàm tiện ích dùng chung (hash mật khẩu, validate...)
│   ├── database/             # Script SQL migration tạo bảng và seed dữ liệu mẫu
│   ├── .env.example          # Tệp mẫu cấu hình biến môi trường cho Backend
│   └── package.json          # Danh sách thư viện và script chạy Backend
├── frontend/                 # Mã nguồn giao diện người dùng (React / Vite)
│   ├── public/               # Tài nguyên tĩnh (favicon, hình ảnh mặc định)
│   ├── src/
│   │   ├── assets/           # CSS, hình ảnh, icon giao diện
│   │   ├── components/       # Các thành phần giao diện tái sử dụng (Navbar, Sidebar, Modal...)
│   │   ├── pages/            # Các trang màn hình chính theo từng vai trò
│   │   ├── services/         # Cấu hình Axios và các hàm gọi API về Backend
│   │   └── utils/            # Hàm định dạng ngày giờ, lưu token, kiểm tra quyền
│   ├── .env.example          # Tệp mẫu cấu hình URL API cho Frontend
│   └── package.json          # Danh sách thư viện và script chạy Frontend
├── docs/                     # Tài liệu dự án
│   ├── cau-truc-thu-muc.md   # Mô tả kiến trúc và cây thư mục của repository
│   └── test-cases.md         # Bảng kịch bản kiểm thử chức năng & phi chức năng
├── .gitignore                # Danh sách tệp/thư mục bỏ qua không đẩy lên Git (node_modules, .env)
└── README.md                 # Hướng dẫn cài đặt, khởi tạo CSDL, chạy dự án và tài khoản demo