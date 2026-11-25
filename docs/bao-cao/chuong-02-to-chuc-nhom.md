# CHƯƠNG 2. TỔ CHỨC NHÓM VÀ QUẢN LÝ DỰ ÁN

## 2.1. Vai trò thành viên

Nhóm gồm 5 thành viên, mỗi người giữ một vai trò chính nhưng đều **làm trọn chức năng của mình từ giao diện xuống cơ sở dữ liệu**, theo mục G của Đặc tả đề tài.

**Bảng 2.1. Vai trò thành viên**

| Mã  | Họ tên             | MSSV       | Vai trò                | Trách nhiệm chính                                                      | Chức năng phụ trách |
| --- | ------------------ | ---------- | ---------------------- | ---------------------------------------------------------------------- | ------------------- |
| TV1 | Nguyễn Ngọc Trọng  | 0306241500 | LE – Trưởng nhóm       | Quản lý dự án, board Trello, chủ trì họp, tài liệu thiết kế, báo cáo   | HT-07, HT-14, HT-15 |
| TV2 | Nguyễn Quang Thông | 0306241490 | BE1 – Backend 1        | Khung kiến trúc 3 lớp, xác thực JWT, phân quyền, nghiệp vụ trắc nghiệm | HT-03, HT-06        |
| TV3 | Lê Đức Phong       | 0306241471 | FE – Frontend          | Wireframe, layout chung, giao diện phân hệ khách và học viên           | HT-01, HT-02, HT-05 |
| TV4 | <br>Hà Hữu Thịnh   | 0306241492 | BE2 – Backend 2 (CSDL) | ERD, migration, dữ liệu mẫu, phân hệ giảng viên                        | HT-09, HT-10        |
| TV5 | Hà Hữu Thịnh       | 0306241432 | GT – Git & Tester      | Quy tắc Git, mẫu PR, review PR, test case, unit test                   | HT-04, HT-11        |

> [Nháp – Biên bản họp 01, 02, 03 đang ghi TV2 là Nguyễn Quang Thông và TV4 là Hà Hữu Thịnh, ngược với đề cương và bảng trên. Nhóm cần chốt lại một cách gọi và sửa đồng bộ các tài liệu.]

## 2.2. Quy trình Scrum rút gọn

Do thời gian làm đồ án ngắn (khoảng 3 tuần, 6 buổi học), nhóm áp dụng **Scrum rút gọn**: giữ lại các hoạt động cốt lõi, bỏ bớt nghi thức không cần thiết.

**Sprint ngắn:** chia dự án thành **5 sprint**, mỗi sprint khoảng 2–4 ngày, gắn với các buổi học trên lớp. Cuối mỗi mốc lớn gắn tag phiên bản trên nhánh `main` (`v0.1`, `v0.5`, `v1.0`).

**Các buổi họp:**

| Hoạt động                     | Cách nhóm thực hiện                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| Sprint planning               | Đầu sprint, trưởng nhóm cùng cả nhóm chọn thẻ từ Product Backlog, chia người phụ trách và hạn           |
| Daily (họp nhanh)             | Không họp hằng ngày; thay bằng **bình luận tiến độ trên thẻ Trello mỗi ngày trước 23:59** và nhắn nhóm  |
| Họp kiểm tra tiến độ          | Họp online qua Discord giữa sprint khi có việc cần chốt (biên bản lưu ở `docs/mettings/`)               |
| Sprint review                 | Demo chức năng trên lớp ở các mốc (Mốc 1 ngày 13/11/2026, demo 70%, bảo vệ cuối kỳ)                      |
| Retrospective                 | Cuối sprint, mỗi người nêu điều làm tốt, điều chưa tốt và cải tiến cho sprint sau (mục 2.4)             |

**Quy tắc làm việc đã thống nhất ở buổi họp 01:**

- Nhóm chat Zalo/Discord, phản hồi trong vòng 12 giờ.
- Cập nhật thẻ Trello và bình luận tiến độ mỗi ngày.
- Không commit thẳng `main`, `develop`; mỗi chức năng một nhánh `feature/HT-xx-...`, PR cần ít nhất 1 người review.
- Mỗi lần dùng AI phải ghi vào `ai-logs/` trước khi commit phần liên quan.

**Board Trello:** board có 7 cột theo luồng công việc. Mỗi chức năng là một thẻ có user story, tiêu chí chấp nhận, checklist, nhãn và người phụ trách. Thẻ di chuyển dần từ trái sang phải khi công việc tiến triển.

| Cột                 | Ý nghĩa                                       |
| ------------------- | --------------------------------------------- |
| [Product Backlog]   | [Toàn bộ user story chưa đưa vào sprint]      |
| [Sprint Backlog]    | [Thẻ đã chọn cho sprint hiện tại]             |
| [Đang làm]          | [Thẻ đang được thực hiện]                     |
| [Chờ review]        | [Đã mở Pull Request, chờ review]              |
| [Kiểm thử]          | [Đã merge vào `develop`, đang kiểm thử]       |
| [Hoàn thành]        | [Đạt tiêu chí chấp nhận]                      |
| [Tài liệu & Biên bản] | [Đề cương, biên bản họp, tài liệu thiết kế] |

> [Nháp – điền đúng tên 7 cột như trên board thật.]

**Hình 2.1. Board Trello của nhóm**

![Board Trello](../images/trello-board.png)

> [Nháp – chụp ảnh board Trello và lưu vào `docs/images/trello-board.png`. Link board: https://trello.com/b/g7hXkb8I/3tpb-quan-ly-hoc-tap-web-2026]

## 2.3. Kế hoạch và tiến độ thực tế từng sprint

**Bảng 2.2. Kế hoạch và thực tế các sprint**

| Sprint | Thời gian (dự kiến) | Kế hoạch                                                                                                           | Thực tế                                                                                                                                                                                                                                    | Đánh giá                       |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| S1     | 09/11 – 13/11/2026  | Thiết kế (use case, ERD, wireframe), khung dự án 3 lớp, đăng ký / đăng nhập; tag `v0.1`                            | Xong đề cương, use case, ERD, wireframe 6 màn hình, sơ đồ tuần tự HT-06, quy tắc Git; khung backend 3 lớp, migration; API đăng ký / đăng nhập; layout và thẻ khóa học dùng dữ liệu giả. Gắn tag `v0.1` ngày 12/11, bảo vệ Mốc 1 ngày 13/11 | Đạt                            |
| S2     | 16/11 – 18/11/2026  | ERD bản cuối, tìm kiếm – lọc – phân trang (HT-01), chi tiết khóa học (HT-02), quản lý khóa học (HT-09)             | Chốt ERD bản cuối và cơ sở dữ liệu; xong HT-01 tìm kiếm, lọc, phân trang ở server; merge HT-02, HT-09                                                                                                                                      | Đạt                            |
| S3     | 19/11 – 21/11/2026  | Nghiệp vụ chính: ghi danh (HT-04), học bài (HT-05), làm trắc nghiệm (HT-06), câu hỏi (HT-11); demo 70%; tag `v0.5` | Merge HT-04 (kèm % tiến độ), HT-05, HT-06, HT-11 và giao diện responsive; thêm unit test HT-05, HT-06. Phát sinh nhiều xung đột khi gộp nhánh                                                                                              | Đạt, trễ nhẹ do xử lý xung đột |
| S4     | 22/11 – 23/11/2026  | Hồ sơ (HT-07), quản trị (HT-14, HT-15), hoàn thiện bài học (HT-10), sửa lỗi                                        | Merge HT-07, HT-14, HT-15; hoàn thiện HT-10 (chương, trạng thái bài học). Họp 03 rà soát 3 lỗi và chốt bổ sung giao diện sửa / xóa khóa học cho giảng viên                                                                                 | Đạt                            |
| S5     | 24/11 – 26/11/2026  | Hoàn thiện giao diện, unit test, kiểm thử chéo, báo cáo; tag `v1.0`                                                | Bổ sung test case HT-04; hoàn thiện giao diện HT-01 → HT-15, sửa lỗi kiểm thử chéo (5/5 lỗi); viết báo cáo chương 5–8. [Chưa gắn tag `v0.5`, `v1.0`]                                                                                       | [Đang thực hiện]               |

> [Nháp – mốc thời gian sprint được suy ra từ lịch sử commit và PR trên GitHub; nhóm đối chiếu lại với các thẻ sprint trên Trello và ngày học thật.]

**Hình 2.2. Biểu đồ số commit theo ngày** *(gợi ý thêm vào báo cáo)*

| Ngày  | 09/11 | 10/11 | 11/11 | 12/11 | 13/11 | 15/11 | 16/11 | 17/11 | 18/11 | 19/11 | 20/11 | 21/11 | 22/11 | 23/11 | 24/11 | 25/11 |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Commit | 3    | 6     | 23    | 30    | 7     | 2     | 14    | 19    | 17    | 25    | 31    | 14    | 14    | 6     | 3     | 49    |

Số commit tăng mạnh ở cuối S1 (chuẩn bị Mốc 1), giữa S3 (gộp các nghiệp vụ chính) và S5 (hoàn thiện giao diện và báo cáo).

## 2.4. Tổng hợp retrospective

**Bảng 2.3. Tổng hợp retrospective các sprint**

| Sprint | Điều làm tốt | Điều chưa tốt | Cải tiến cho sprint sau |
| ------ | ------------ | ------------- | ----------------------- |
| S1 | Chốt sớm kiến trúc, quy ước API (JSON, JWT, mã lỗi, thông báo tiếng Việt); wireframe được duyệt; cả 5 người có PR đầu tiên được merge | TV2 và TV3 cùng làm form đăng ký / đăng nhập, trùng việc | Thống nhất **hình dạng dữ liệu API trước**, frontend dùng dữ liệu giả để làm song song với backend |
| S2 | Phân trang, tìm kiếm làm ở server đúng quy ước; ERD bản cuối ổn định | Nhánh tính năng tách từ `develop` cũ, khi gộp bị xung đột | Kéo `develop` về nhánh của mình mỗi ngày trước khi làm tiếp |
| S3 | Hoàn thành phần lớn nghiệp vụ chính; nghiệp vụ trắc nghiệm kiểm soát chặt ở server (HT-NFR1) | Xung đột nhiều ở tệp dùng chung (`server.js`, `App.jsx`, `package-lock.json`, ảnh `.png`); có lỗi điều hướng sau khi merge (bấm thẻ khóa học vào nhầm trang làm bài) | Chạy `git fetch --all --prune` và kiểm tra `git status` trước khi tạo nhánh; người merge thử lại luồng chính trên trình duyệt sau mỗi lần gộp |
| S4 | Phân hệ quản trị và hồ sơ xong đúng hạn; họp 03 rà soát lỗi có bảng theo dõi rõ ràng | Một số lỗi chỉ thử với dữ liệu giả, chưa thử với dữ liệu thật; giảng viên còn thiếu giao diện sửa / xóa khóa học | Tắt dữ liệu giả khi kiểm thử; bổ sung đủ CRUD khóa học cho giảng viên |
| S5 | Kiểm thử chéo phát hiện và sửa hết 5/5 lỗi; báo cáo được chia cho từng người | [..] | [..] |

> [Nháp – nội dung retrospective được tổng hợp từ biên bản họp và các sự cố ghi trong lịch sử Git; nhóm bổ sung ý kiến thật của từng thành viên, đặc biệt sprint S5.]

## 2.5. Đánh giá phân công

**Bảng 2.4. Ma trận phân công**

Ký hiệu: **C** – phụ trách chính, **H** – hỗ trợ, **R** – review / kiểm thử.

| Hạng mục                        | TV1 | TV2 | TV3 | TV4 | TV5 |
| ------------------------------- | --- | --- | --- | --- | --- |
| Đề cương, quản lý Trello, họp   | C   |     |     |     |     |
| Use case, đặc tả, sơ đồ tuần tự | C   | H   |     |     |     |
| Wireframe, layout chung         |     |     | C   |     | R   |
| ERD, migration, dữ liệu mẫu     | H   |     |     | C   | R   |
| Kiến trúc 3 lớp, xác thực JWT   |     | C   |     | H   | R   |
| Quy tắc Git, mẫu PR             | H   |     |     |     | C   |
| HT-01, HT-02, HT-05             |     |     | C   |     | R   |
| HT-03, HT-06                    |     | C   | H   |     | R   |
| HT-04, HT-11                    |     |     | H   |     | C   |
| HT-07, HT-14, HT-15             | C   |     | H   |     | R   |
| HT-09, HT-10                    |     |     | H   | C   | R   |
| Unit test, test case            | H   | H   |     |     | C   |
| Kiểm thử chéo                   | H   | H   | H   | H   | C   |
| Báo cáo                         | C   | H   | H   | H   | H   |

> [Nháp – cột H/R đang điền theo vai trò; nhóm sửa lại theo đóng góp thực tế.]

**Đánh giá:**

- **Mức độ hoàn thành:** cả 12 chức năng bắt buộc đã có đủ backend và giao diện; 4 yêu cầu phi chức năng HT-NFR1 → HT-NFR4 đều được kiểm soát ở server.
- **Mức độ đóng góp:** thống kê số commit, số PR đã tạo và đã review của từng người trình bày ở mục 8.2. [Bổ sung nhận xét: phân công có cân bằng không, ai gánh thêm việc gì.]
- **Điểm hợp lý:** chia theo chức năng trọn gói (giao diện → API → CSDL) giúp mỗi người hiểu hết luồng của mình và dễ quy trách nhiệm khi có lỗi.
- **Điểm chưa hợp lý:** TV3 (Frontend) vừa làm giao diện chức năng của mình vừa hỗ trợ giao diện nhiều chức năng khác; nhiều nhánh cùng sửa tệp dùng chung nên xung đột tăng vào giữa dự án. Trưởng nhóm phải dành nhiều thời gian gộp nhánh ở cuối sprint.
- **Bài học:** chia nhỏ nhánh hơn, merge sớm và thường xuyên hơn; chốt cấu trúc tệp dùng chung (route, menu) ngay từ sprint đầu.
