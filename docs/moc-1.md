# Mốc 1 – Bảo vệ thiết kế

Đồ án Lập trình Web · Đề tài **Quản lý học tập** · Nhóm 2

Ngày bảo vệ: Thứ 6 tuần 1, 13/11/2026 · Thời lượng khoảng 10 phút

| Repository    | `3TBP-Project/3tpb-quan-ly-hoc-tap` |     |
| ------------- | ----------------------------------- | --- |
| Trello        | https://trello.com/b/g7hXkb8I/3tpb-quan-ly-hoc-tap-web-2026 |     |
| Tag phiên bản | `v0.1` (gắn cuối buổi Ngày 5)       |     |

## 1. Thành viên và vai trò

| Mã  | Họ tên             | MSSV       | Vai trò                         |
| --- | ------------------ | ---------- | ------------------------------- |
| TV1 | Nguyễn Ngọc Trọng  | 0306241500 | Trưởng nhóm, quản lý dự án      |
| TV2 | Nguyễn Quang Thông | 0306241492 | Backend 1 – xác thực, nghiệp vụ |
| TV3 | Lê Đức Phong       | 0306241471 | Frontend                        |
| TV4 | Hà Hữu Thịnh       | 0306241490 | Backend 2 – cơ sở dữ liệu       |
| TV5 | Trần Thanh Bình    | 0306241432 | Git và kiểm thử                 |

Mỗi người làm trọn chức năng của mình từ giao diện xuống cơ sở dữ liệu, theo đúng mục G của Đặc tả.

## 2. Đề tài

Nền tảng khóa học trực tuyến **miễn phí**. Giảng viên soạn khóa học, bài học và bài trắc nghiệm. Học viên ghi danh, học bài, làm bài và được chấm điểm tự động.

**Bốn phân hệ:**

| Phân hệ | Người dùng | Làm được gì |
| --- | --- | --- |
| Khách vãng lai | Chưa đăng nhập | Xem và tìm khóa học, đăng ký tài khoản |
| Học viên | Đã đăng nhập | Ghi danh, học bài, làm trắc nghiệm, xem kết quả |
| Giảng viên | Do quản trị cấp tài khoản | Soạn khóa học, bài học, câu hỏi |
| Quản trị | Quản lý hệ thống | Quản lý tài khoản, danh mục, duyệt khóa học |

**Ngoài phạm vi** (theo Đặc tả mục E3, nhóm không làm): bán khóa học, lớp học trực tuyến, cấp chứng chỉ, câu hỏi tự luận chấm tay, chấm bài lập trình tự động, chống gian lận khi thi.

Chi tiết: [`docs/de-cuong.md`](de-cuong.md)

## 3. Công nghệ

| Lớp               | Công nghệ         | Lý do chọn                                                                   |
| ----------------- | ----------------- | ---------------------------------------------------------------------------- |
| Giao diện         | React             | Cả nhóm đã học, tách biệt rõ với backend                                     |
| Máy chủ           | Node.js + Express | Cùng ngôn ngữ JavaScript với frontend, nhóm không phải học thêm ngôn ngữ mới |
| Cơ sở dữ liệu     | MySQL             | Có sẵn trên máy mọi người, nhóm đã quen SQL                                  |

Cách truyền dữ liệu: **React gọi API**, server trả JSON, không dựng sẵn HTML.

## 4. Kiến trúc

Kiến trúc **3 lớp**, mỗi lớp chỉ gọi lớp ngay dưới nó:

```
React  →  Controller  →  Service  →  Repository  →  MySQL
             ↑
        Middleware (xác thực JWT, phân quyền theo vai trò)
```

| Lớp | Trách nhiệm | Không được làm |
| --- | --- | --- |
| Controller | Nhận request, kiểm tra dữ liệu đầu vào, trả response | Không viết truy vấn CSDL |
| Service | Xử lý nghiệp vụ, kiểm tra quyền sở hữu | Không đụng tới `req` và `res` |
| Repository | Truy vấn cơ sở dữ liệu | Không chứa logic nghiệp vụ |

| Đường dẫn                     | Ai vào được                     |
| ----------------------------- | ------------------------------- |
| `GET /api/courses`, `/api/auth/*` | Mọi người, kể cả chưa đăng nhập |
| `/api/users/*`, `/api/enrollments/*`, `/api/quizzes/*` | Đã đăng nhập (ghi danh, học bài, làm bài chỉ cho học viên) |
| `/api/teacher/*`, quản lý khóa học / chương / bài học / câu hỏi | Giảng viên (quản trị viên được phép ở một số route quản lý) |
| `/api/admin/*`                | Chỉ quản trị                    |

Ẩn menu ở giao diện chỉ là tiện ích. Quyền thật do middleware quyết định.


## 5. Cơ sở dữ liệu

**8 bảng:**

| Bảng | Nội dung |
| --- | --- |
| `users` | Tài khoản, vai trò student/teacher/admin, trạng thái khóa |
| `categories` | Danh mục khóa học |
| `courses` | Khóa học, trạng thái nháp/công khai/ẩn, thời gian làm bài |
| `lessons` | Bài học, thứ tự, link video, tệp PDF |
| `enrollments` | Học viên ghi danh khóa học |
| `lesson_progress` | Học viên đã hoàn thành bài nào |
| `questions` | Câu hỏi trắc nghiệm của khóa |
| `quiz_attempts` | Từng lượt làm bài và điểm |

**Ba quyết định thiết kế cần nói khi bảo vệ:**

1. **Tiến độ học lưu theo từng bài**, ở bảng `lesson_progress` riêng, không lưu một con số phần trăm trong `enrollments`. Đặc tả gợi ý 7 bảng, nhóm tách thành 8. Lý do: biết chính xác học viên đã học bài nào, và phần trăm tiến độ tính ra được từ dữ liệu này.

2. **Chặn ghi danh trùng bằng ràng buộc `UNIQUE (user_id, course_id)` ở cơ sở dữ liệu**, không kiểm tra bằng câu `SELECT` trước khi `INSERT`. Hai người bấm cùng lúc thì cách kiểm tra trước vẫn lọt, còn ràng buộc thì không.

3. **Không cho xóa danh mục đang có khóa học.** Khóa ngoại `courses.category_id` trong migration là `ON DELETE CASCADE`, nên việc chặn được làm ở server: trước khi xóa, service đếm số khóa học của danh mục và trả lỗi `409` nếu còn khóa học, thay vì để cơ sở dữ liệu xóa sạch khóa học bên trong.

> Cập nhật sau Mốc 1: CSDL được bổ sung thêm 4 bảng (`chapters`, `quiz_attempt_answers`, `comments`, `discussions`), hiện có 12 bảng. ERD dưới đây là bản cuối.

ERD: [`docs/database/erd-final.png`](database/erd-final.png) · Mô tả từng bảng: [`docs/bao-cao/chuong-5-CSDL-ERD.md`](bao-cao/chuong-5-CSDL-ERD.md)

## 6. Yêu cầu chức năng

Đặc tả có **16 chức năng**, gồm 12 bắt buộc (mức B) và 4 cộng điểm (mức C). Nhóm làm đủ 12 chức năng bắt buộc và dự kiến 2 chức năng cộng điểm HT-08, HT-12 (bảng dưới).

| Mã    | Chức năng                   | Phân hệ        | Mức | Người làm      |
| ----- | --------------------------- | -------------- | --- | -------------- |
| HT-01 | Danh sách khóa học          | Khách vãng lai | B   | TV3            |
| HT-02 | Chi tiết khóa học           | Khách vãng lai | B   | TV3            |
| HT-03 | Đăng ký, đăng nhập          | Khách vãng lai | B   | TV2            |
| HT-04 | Ghi danh, Khóa học của tôi  | Học viên       | B   | TV5            |
| HT-05 | Học bài                     | Học viên       | B   | TV3            |
| HT-06 | Làm bài trắc nghiệm         | Học viên       | B   | TV2            |
| HT-07 | Hồ sơ và kết quả học tập    | Học viên       | B   | TV1            |
| HT-08 | Hỏi đáp trong bài học       | Học viên       | C   | phân sau Mốc 2 |
| HT-09 | Quản lý khóa học            | Giảng viên     | B   | TV4            |
| HT-10 | Quản lý bài học             | Giảng viên     | B   | TV4            |
| HT-11 | Quản lý câu hỏi trắc nghiệm | Giảng viên     | B   | TV5            |
| HT-12 | Theo dõi học viên           | Giảng viên     | C   | phân sau Mốc 2 |
| HT-14 | Quản lý người dùng          | Quản trị       | B   | TV1            |
| HT-15 | Danh mục và duyệt khóa học  | Quản trị       | B   | TV1            |


Mỗi chức năng là một thẻ trên Trello, có user story, tiêu chí chấp nhận, checklist và người phụ trách.

**Bốn yêu cầu phi chức năng riêng của đề tài:**

| Mã | Nội dung | Thực hiện ở đâu |
| --- | --- | --- |
| HT-NFR1 | Đáp án đúng không gửi xuống trình duyệt trước khi nộp; chấm điểm và tính giờ ở server | HT-06 |
| HT-NFR2 | Chỉ học viên đã ghi danh xem được nội dung bài học và tệp đính kèm | HT-02, HT-05 |
| HT-NFR3 | Giảng viên chỉ sửa được khóa học của mình, kiểm tra ở server | HT-09, HT-10, HT-11 |
| HT-NFR4 | Không lưu tệp video trên server, chỉ nhúng link | HT-05, HT-10 |

Use case: [`docs/usecase.png`](usecase.png) · Đặc tả: [`docs/bang-dac-ta-use-case.md`](bang-dac-ta-use-case.md) · Wireframe: [`docs/wireframes/`](wireframes/)

## 7. Luồng xử lý chính

Sơ đồ tuần tự cho chức năng phức tạp nhất – **HT-06 Làm bài trắc nghiệm**, gồm hai giai đoạn:

**Bắt đầu làm bài:** server kiểm tra học viên đã ghi danh và còn lượt làm (tối đa 3), tạo lượt mới và **ghi giờ bắt đầu**, lấy câu hỏi rồi **bỏ đáp án đúng ra** trước khi gửi xuống trình duyệt.

**Nộp bài:** server lấy giờ bắt đầu đã lưu, **tự tính thời gian đã làm** để biết có quá giờ không, rồi mới chấm điểm và lưu. Quá giờ thì từ chối, bài không được tính điểm.

Điểm cần nhấn: đồng hồ đếm ngược trên giao diện chỉ để người dùng nhìn. Toàn bộ việc ghi giờ, giấu đáp án, kiểm tra giờ và chấm điểm đều làm ở server, nên học viên sửa đồng hồ máy hay mở công cụ trình duyệt đều không gian lận được.

Sơ đồ: [`docs/sequence-lam-bai-trac-nghiem.png`](sequence-lam-bai-trac-nghiem.png)

## 8. Phân công trình bày (khoảng 10 phút)

| Người | Nội dung                                                  | Thời lượng |
| ----- | --------------------------------------------------------- | ---------- |
| TV1   | Tổng quan đề tài, phạm vi, mở board Trello                | 2 phút     |
| TV2   | Kiến trúc 3 lớp và phân quyền, demo đăng nhập 3 tài khoản | 3 phút     |
| TV4   | ERD và 3 quyết định thiết kế ở mục 5                      | 2 phút     |
| TV3   | Wireframe và ảnh chụp giao diện                           | 2 phút     |
| TV5   | Quy trình Git, số commit từng người, AI log               | 1 phút     |

## 9. Tài liệu kèm theo

| Tài liệu               | Đường dẫn                              |
| ---------------------- | -------------------------------------- |
| Đề cương               | `docs/de-cuong.md`                     |
| Use case diagram       | `docs/usecase.png`                     |
| Wireframe 6 màn hình   | `docs/wireframes/`                     |
| ERD bản cuối           | `docs/database/erd-final.png`          |
| Mô tả các bảng         | `docs/bao-cao/chuong-5-CSDL-ERD.md`    |
| Sequence diagram HT-06 | `docs/sequence-lam-bai-trac-nghiem.png` |
| Quy tắc Git            | `docs/git-rules.md`                    |
| Biên bản họp 01, 02    | `docs/mettings/`                       |
| Nhật ký dùng AI        | `ai-logs/`                             |
