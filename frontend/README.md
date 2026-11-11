<!-- AI-assisted [AI-05] -->
# Frontend – Website quản lý học tập trực tuyến

Phần giao diện (client) của đồ án Lập trình Web, nhóm 3TBP. Ứng dụng chạy trên trình duyệt và gọi REST API của backend (Node.js + Express).

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Thư viện giao diện | React 19 |
| Công cụ build, chạy dev | Vite |
| Giao diện, responsive | Bootstrap 5, React-Bootstrap |
| Định tuyến | React Router |
| Gọi API | Axios |
| Kiểm tra mã | ESLint |

## Yêu cầu

- Node.js 20.19 trở lên (kiểm tra bằng `node -v`) và npm đi kèm.

## Cài đặt và chạy

Chạy các lệnh sau trong thư mục `frontend/`:

```bash
npm install
```

Tạo tệp biến môi trường từ tệp mẫu (xem mục "Biến môi trường" bên dưới):

```bash
cp .env.example .env
```

Trên Windows PowerShell dùng `Copy-Item .env.example .env`.

Chạy chế độ phát triển:

```bash
npm run dev
```

Mở địa chỉ mà Vite in ra ở terminal (thường là `http://localhost:5173`).

## Các lệnh hay dùng

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy máy chủ phát triển, tự nạp lại khi sửa mã |
| `npm run build` | Build bản production vào thư mục `dist/` |
| `npm run preview` | Chạy thử bản đã build |
| `npm run lint` | Kiểm tra mã bằng ESLint |

## Biến môi trường

| Biến | Ý nghĩa |
| --- | --- |
| `VITE_API_URL` | Địa chỉ gốc của REST API (backend) |

- Tệp `.env` đã được `.gitignore` bỏ qua, không commit lên repository.
- Chỉ các biến bắt đầu bằng `VITE_` mới đọc được trong mã. Chúng hiển thị công khai trên trình duyệt, nên không đặt mật khẩu hay khóa bí mật ở đây.
- Sau khi sửa `.env`, cần khởi động lại `npm run dev`.

## Cấu trúc thư mục

```
src/
  components/
    layout/    Layout, Header, Footer (khung giao diện chung)
    course/    CourseCard (thẻ khóa học)
  pages/       Các trang (hiện có CourseListPage tạm)
  main.jsx     Điểm khởi động, bọc BrowserRouter
  App.jsx      Khai báo các route
```

Các thư mục `services/` (gọi API), `context/` (trạng thái đăng nhập) và `common/` (component dùng chung) sẽ được thêm khi các chức năng tương ứng được làm.

## Hiện trạng

- Đã có: layout chung (Header, Footer), thẻ khóa học `CourseCard`, trang danh sách khóa học tạm.
- Menu ở Header đang dùng vai trò giả (biến `currentRole` trong `Header.jsx`) để xem từng menu. Sẽ thay bằng trạng thái đăng nhập thật.
- Chưa nối với backend: các đường dẫn như `/login`, `/my-courses`, `/teacher/courses`, `/admin/...` chưa có trang.

## Quy ước làm việc

- Mỗi chức năng một nhánh `feature/HT-xx-mo-ta` tạo từ `develop`, không commit trực tiếp vào `develop` hoặc `main`.
- Thông điệp commit theo Conventional Commits, kèm mã chức năng, ví dụ `feat(HT-01): trang danh sach khoa hoc`.
- Mọi thay đổi vào `develop` qua pull request và cần ít nhất một thành viên khác review.
- Đoạn mã có AI hỗ trợ phải ghi vào `ai-logs/` và đánh dấu theo quy định của môn học.
