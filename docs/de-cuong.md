# Đề cương đồ án – Nhóm [2]

> Mẫu đề cương 1 trang, nộp ở tiết 5 buổi 1 để giảng viên duyệt. Thay mọi chỗ trong `[...]`, xóa các dòng ghi chú bắt đầu bằng `>` trước khi commit.

## 1. Thông tin chung

| Mục | Nội dung |
| --- | --- |
| Đề tài | [Quản lý học tập] |
| Tên sản phẩm | [Website quản lý học tập] |
| Lớp, nhóm | [CĐ CNTT 24WEBD] – Nhóm [3TBP] |
| Repository | [https://github.com/NGtrongSNG/3tbp-quan-ly-hoc-tap] (Private, đã mời GV) |
| Board Trello | [https://trello.com/b/g7hXkb8I/3tpb-quan-ly-hoc-tap-web-2026] (đã mời GV) |
| Ngày lập | [09/11/2026] |

## 2. Thành viên và vai trò

| Mã | Họ tên | MSSV | Vai trò | Email | Phụ trách chính |
| --- | --- | --- | --- | --- | --- |
| TV1 | [Nguyễn Ngọc Trọng] | [0306241500] | LE – Leader (trưởng nhóm) | [0306241500@caothang.edu.vn] | Quản lý dự án, Trello, [mã chức năng] |
| TV2 | [Hà Hữu Thịnh] | [0306241490] | BE 1 – Backend 1 | [0306241490@caothang.edu.vn] | Xác thực, nghiệp vụ chính, [mã] |
| TV3 | [Lê Đức Phong] | [0306241471] | FE – Frontend | [0306241471@caothang.edu.vn] | Giao diện người dùng, [mã] |
| TV4 | [Nguyễn Quang Thông] | [0306241492] | BE 2 – Backend 2 (CSDL) | [0306241492@caothang.edu.vn] | ERD, migration, quản trị, [mã] |
| TV5 | [Trần Thanh Bình] | [0306241432] | GT – Git & Tester | [0306241432@caothang.edu.vn] | Quy tắc Git, review PR, kiểm thử, [mã] |

## 3. Công nghệ

| Thành phần    | Lựa chọn                                            | Lý do chọn                                                                                                                |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Backend       | [Node.js + Express]                                 | [Năng lực của nhóm: Trung Bình,<br>Tài liệu: Giáo trình/Slide môn Lập trình ứng dụng với NodeJS]                          |
| Frontend      | [ReactJS] + [Bootstrap / Tailwind]                  | [Đã học trong chương trình chính khóa ở học kỳ 5. Tài Liệu: Slide môn lập trình Front End]                                |
| Cơ sở dữ liệu | [MySQL]                                             | [Đã học trong chương trình chính khóa ở học kỳ 2 và 3. Tài Liệu: Giáo trình/Slide môm Cơ Sở Dữ Liệu và HQT Cơ Sở Dữ Liệu] |
| Kiến trúc     | Client - Server                                     | Đã được đề cập trong chương trình chính khóa                                                                              |
| Công cụ       | Git/GitHub, Trello, [VS Code], [AI: ChatGPT/Claude] |                                                                                                                           |

## 4. Phạm vi chức năng

Bắt buộc (Must) – mã theo đặc tả đề tài:

| Mã   | Chức năng                   | Người phụ trách                                        |
| ---- | --------------------------- | ------------------------------------------------------ |
| HT01 | Danh sách khóa học          | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT02 | Chi tiết khóa học           | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT03 | Đăng ký, đăng nhập          | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT04 | Ghi danh, khóa học của tôi  | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT05 | Học bài                     | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT06 | Làm bài trắc nghiệm         | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT07 | Hồ sơ và kết quả học tập    | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT08 | Hỏi đáp trong bài học       | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT09 | Quản lý khóa học            | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT10 | Quản lý bài học             | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT11 | Quản lý câu hỏi trắc nghiệm | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT12 | Theo dõi học viên           | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT14 | Quản lý người dùng          | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |
| HT15 | Danh mục và duyệt khóa học  | Nguyễn Quang Thông - BE Lead<br>Lê Đức Phong - FE Lead |

Cộng điểm (Could), làm khi còn thời gian: [HT-12, HT-08]

Ngoài phạm vi (không làm): [thanh toán thật, ứng dụng di động, ...]

## 5. Rủi ro và cách xử lý

| Rủi ro | Mức độ | Cách phòng tránh / xử lý |
| --- | --- | --- |
| [Thành viên chưa quen công nghệ đã chọn] | [Cao] | [Pair-programming tuần 1, dùng mẫu khung dự án chung] |
| [Xung đột Git khi nhiều người sửa cùng tệp] | [Trung bình] | [Nhánh nhỏ theo chức năng, pull `develop` mỗi ngày] |
| [Trễ tiến độ chức năng nghiệp vụ chính] | [Cao] | [Ưu tiên làm sớm ở sprint S2, có người dự phòng] |

## 6. Kế hoạch sprint

| Sprint | Thời gian | Mục tiêu |
| --- | --- | --- |
| S1 | Buổi 1 → Buổi 2 | Thiết kế (ERD, use case, wireframe), khung dự án, đăng ký/đăng nhập; tag `v0.1` |
| S2 – S3 | Buổi 2 → Buổi 4 | CRUD, tìm kiếm, nghiệp vụ chính; demo 70%; tag `v0.5` |
| S4 – S5 | Buổi 4 → Buổi 6 | Hoàn thiện, unit test, kiểm thử chéo, báo cáo; tag `v1.0` |

## 7. Duyệt đề cương

- Ý kiến giảng viên: [...]
- Kết quả: ☐ Duyệt  ☐ Duyệt có chỉnh sửa  ☐ Làm lại
