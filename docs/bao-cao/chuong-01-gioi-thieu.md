# CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI

## 1.1. Bối cảnh và lý do chọn đề tài

Học trực tuyến ngày càng phổ biến, nhất là với sinh viên và người đi làm muốn tự học thêm kỹ năng ngoài giờ. Người học cần một nơi tập trung để tìm khóa học, học theo thứ tự bài, tự kiểm tra kiến thức và theo dõi mình đã học tới đâu. Người dạy cần một công cụ đơn giản để đưa bài giảng, video, tài liệu và câu hỏi kiểm tra lên mạng mà không phải tự dựng website riêng.

Các nền tảng lớn hiện có thường thu phí, nhiều tính năng phức tạp, hoặc không cho giảng viên tự quản lý nội dung của mình. Vì vậy nhóm chọn đề tài **Quản lý học tập**: xây dựng một website khóa học trực tuyến **miễn phí**, gọn nhẹ. Giảng viên soạn khóa học, bài học và bài trắc nghiệm. Học viên ghi danh, học bài, làm bài và được chấm điểm tự động.

Đề tài phù hợp với nhóm vì:

- Bao quát đủ các nội dung trọng tâm của môn Lập trình Web: xác thực và phân quyền nhiều vai trò, CRUD có kiểm tra quyền sở hữu, tìm kiếm – lọc – phân trang, tải tệp lên, và một nghiệp vụ có quy tắc chặt chẽ (chấm trắc nghiệm có giới hạn thời gian và số lượt).
- Công nghệ sử dụng (Node.js + Express, ReactJS, MySQL) đều đã được học trong chương trình chính khóa.
- Nghiệp vụ gần gũi với chính sinh viên, dễ tự kiểm thử và đánh giá.

## 1.2. Mục tiêu

**Mục tiêu sản phẩm:**

1. Xây dựng website quản lý học tập theo mô hình Client – Server: giao diện ReactJS gọi API, máy chủ Node.js/Express trả JSON, dữ liệu lưu trong MySQL.
2. Hoàn thành đủ **12 chức năng bắt buộc** (mức B) cho 4 phân hệ người dùng.
3. Đáp ứng 4 yêu cầu phi chức năng riêng của đề tài:
   - `HT-NFR1`: Đáp án đúng không gửi xuống trình duyệt trước khi nộp; chấm điểm và tính giờ ở server.
   - `HT-NFR2`: Chỉ học viên đã ghi danh mới xem được nội dung bài học và tệp đính kèm.
   - `HT-NFR3`: Giảng viên chỉ sửa được khóa học của mình, kiểm tra ở server.
   - `HT-NFR4`: Không lưu tệp video trên server, chỉ nhúng link.
4. Giao diện tiếng Việt, dùng được trên máy tính và điện thoại (responsive).

**Mục tiêu học tập của nhóm:**

1. Làm việc nhóm theo quy trình Scrum rút gọn, quản lý công việc trên Trello.
2. Quản lý mã nguồn bằng Git/GitHub theo mô hình nhánh, mỗi chức năng một nhánh, mọi thay đổi đi qua Pull Request có review.
3. Mỗi thành viên làm trọn chức năng của mình từ giao diện xuống cơ sở dữ liệu.
4. Viết unit test cho các nghiệp vụ chính và kiểm thử chéo trước khi nộp.
5. Ghi nhật ký sử dụng AI (`ai-logs/`) minh bạch cho mọi phần có AI hỗ trợ.

## 1.3. Phạm vi

### 1.3.1. Bốn phân hệ người dùng

**Bảng 1.1. Bốn phân hệ người dùng**

| Phân hệ        | Người dùng                                | Chức năng chính                                                      |
| -------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| Khách vãng lai | Người chưa đăng nhập                      | Xem danh sách và chi tiết khóa học, tìm kiếm, lọc; đăng ký tài khoản |
| Học viên       | Người đã đăng ký và đăng nhập             | Ghi danh khóa học, học bài, làm bài trắc nghiệm, xem hồ sơ và kết quả |
| Giảng viên     | Tài khoản do quản trị viên cấp            | Quản lý khóa học, bài học, câu hỏi trắc nghiệm của mình              |
| Quản trị viên  | Người quản lý hệ thống                    | Quản lý người dùng, danh mục, ẩn / bỏ ẩn khóa học vi phạm            |

### 1.3.2. Mười hai chức năng bắt buộc

**Bảng 1.2. Danh sách chức năng bắt buộc (mức B)**

| Mã    | Chức năng                   | Phân hệ        | Người phụ trách |
| ----- | --------------------------- | -------------- | --------------- |
| HT-01 | Danh sách khóa học          | Khách vãng lai | TV3             |
| HT-02 | Chi tiết khóa học           | Khách vãng lai | TV3             |
| HT-03 | Đăng ký, đăng nhập          | Khách vãng lai | TV2             |
| HT-04 | Ghi danh, khóa học của tôi  | Học viên       | TV5             |
| HT-05 | Học bài                     | Học viên       | TV3             |
| HT-06 | Làm bài trắc nghiệm         | Học viên       | TV2             |
| HT-07 | Hồ sơ và kết quả học tập    | Học viên       | TV1             |
| HT-09 | Quản lý khóa học            | Giảng viên     | TV4             |
| HT-10 | Quản lý bài học             | Giảng viên     | TV4             |
| HT-11 | Quản lý câu hỏi trắc nghiệm | Giảng viên     | TV5             |
| HT-14 | Quản lý người dùng          | Quản trị viên  | TV1             |
| HT-15 | Danh mục và duyệt khóa học  | Quản trị viên  | TV1             |

Đặc tả chi tiết từng chức năng xem tại [`docs/bang-dac-ta-use-case.md`](../bang-dac-ta-use-case.md).

### 1.3.3. Chức năng cộng điểm đã làm

Theo đề cương, nhóm dự kiến làm thêm `HT-08` (Hỏi đáp trong bài học) và `HT-12` (Theo dõi học viên) nếu còn thời gian. Tình trạng hiện tại:

| Mã    | Chức năng             | Tình trạng                                                                                 |
| ----- | --------------------- | ------------------------------------------------------------------------------------------ |
| HT-08 | Hỏi đáp trong bài học | Đã có API backend cho bình luận khóa học và thảo luận trong bài học; **chưa có giao diện** |
| HT-12 | Theo dõi học viên     | Chưa làm                                                                                   |

> [Nháp – cần nhóm xác nhận lại trước khi nộp: nếu kịp làm giao diện HT-08 thì cập nhật bảng trên.]

Ngoài 12 chức năng bắt buộc, nhóm bổ sung một số điểm mở rộng trong quá trình làm:

- Chia bài học theo **chương**, sắp xếp lại thứ tự chương và bài.
- **Học tuần tự**: phải hoàn thành bài trước mới mở được bài sau.
- **Xem lại bài làm** trắc nghiệm từng lượt, có đánh dấu đáp án đúng / sai.
- Ảnh đại diện người dùng và ảnh bìa khóa học.
- Giảng viên được cấp mật khẩu tạm và **bắt buộc đổi mật khẩu** trước khi quản lý nội dung.

### 1.3.4. Ngoài phạm vi

Theo Đặc tả đề tài (mục E3), nhóm **không** làm các nội dung sau:

- Bán khóa học, thanh toán thật.
- Lớp học trực tuyến (học trực tiếp qua video call).
- Cấp chứng chỉ hoàn thành khóa học.
- Câu hỏi tự luận chấm tay, chấm bài lập trình tự động.
- Chống gian lận khi thi (giám sát camera, khóa trình duyệt).
- Ứng dụng di động riêng (chỉ làm website responsive).

## 1.4. Bố cục báo cáo

Báo cáo gồm các chương sau:

- **Chương 1 – Giới thiệu đề tài:** bối cảnh, mục tiêu và phạm vi của đề tài.
- **Chương 2 – Tổ chức nhóm và quản lý dự án:** vai trò thành viên, quy trình Scrum rút gọn, kế hoạch và tiến độ các sprint, retrospective và đánh giá phân công.
- **Chương 3 – [Phân tích yêu cầu]:** [use case, đặc tả use case, yêu cầu phi chức năng].
- **Chương 4 – [Thiết kế]:** [cơ sở dữ liệu, giao diện (wireframe), sơ đồ tuần tự].
- **Chương 5 – Kiến trúc hệ thống:** kiến trúc Client – Server và 3 lớp, thiết kế phân quyền 3 vai trò.
- **Chương 6 – Cài đặt:** cấu trúc mã nguồn, mẫu thiết kế áp dụng, phân tích nghiệp vụ tiêu biểu HT-06.
- **Chương 7 – Kiểm thử:** kế hoạch kiểm thử, unit test, bảng test case, kiểm thử chéo.
- **Chương 8 – Quản lý mã nguồn:** mô hình nhánh, quy tắc commit, thống kê đóng góp, tag phiên bản, sự cố Git.
- **Chương 9 – [Kết luận]:** [kết quả đạt được, hạn chế, hướng phát triển].

> [Nháp – tên chương 3, 4, 9 đang để theo dự kiến, sửa lại theo mẫu báo cáo của giảng viên.]
