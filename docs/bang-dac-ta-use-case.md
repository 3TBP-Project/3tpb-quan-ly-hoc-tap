## UC01 – Làm bài trắc nghiệm

| Mục                  | Nội dung                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mã use case          | UC01                                                                                                                                                  |
| Tên                  | Làm bài trắc nghiệm                                                                                                                                   |
| Tác nhân             | Học viên                                                                                                                                              |
| Mô tả                | Học viên làm bài trắc nghiệm trong thời gian giới hạn và được hệ thống chấm điểm tự động                                                              |
| Điều kiện trước      | Học viên đã đăng nhập; đã ghi danh khóa học; khóa học đã có danh sách câu hỏi trắc nghiệm và bốc ngẫu nhiên câu hỏi                                   |
| Kết quả (thành công) | Một lượt làm bài mới được lưu vào `quiz_attempts` kèm điểm; học viên thấy điểm lần này, điểm cao nhất và số lượt còn lại                              |
| Kết quả (thất bại)   | Không tạo lượt mới, hoặc lượt bị đánh dấu nộp trễ với điểm 0                                                                                          |
| Ràng buộc            | Mỗi học viên làm tối đa **3 lần** mỗi khóa, lấy điểm cao nhất. Đáp án đúng không được gửi xuống trình duyệt; chấm điểm và tính giờ ở server (HT-NFR1) |

## UC02 – Quản lý bài học

| Mục                  | Nội dung                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mã use case          | UC02                                                                                                                                                     |
| Tên                  | Quản lý bài học                                                                                                                                          |
| Tác nhân             | Giảng viên                                                                                                                                               |
| Mô tả                | Giảng viên thêm, sửa, xóa và sắp xếp thứ tự bài học trong khóa học của mình                                                                              |
| Điều kiện trước      | Giảng viên đã đăng nhập; khóa học đang thao tác do chính giảng viên đó tạo                                                                               |
| Kết quả (thành công) | Bài học được thêm, sửa, xóa hoặc đổi thứ tự trong bảng `lessons`; danh sách bài học hiển thị đúng thay đổi                                               |
| Kết quả (thất bại)   | Dữ liệu bài học không thay đổi; giảng viên thấy thông báo lỗi cụ thể                                                                                     |
| Ràng buộc            | Tệp PDF tối đa **5 MB**. Video chỉ lưu link, không tải tệp video lên server (HT-NFR4). Chỉ thao tác được trên khóa của mình, kiểm tra ở server (HT-NFR3) |
## UC-03: Ghi danh khóa học

| Mục                  | Nội dung                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Mã use case          | UC03                                                                                                       |
| Tên                  | Ghi danh khóa học                                                                                          |
| Tác nhân             | Học viên (khách vãng lai bấm ghi danh sẽ được yêu cầu đăng nhập)                                           |
| Mô tả                | Học viên đăng ký tham gia một khóa học để được học bài và làm bài trắc nghiệm                              |
| Điều kiện trước      | Học viên đã đăng nhập; khóa học tồn tại và đang được công khai                                             |
| Kết quả (thành công) | Một dòng mới trong bảng `enrollments`; khóa học xuất hiện ở trang **Khóa học của tôi** với tiến độ 0%      |
| Kết quả (thất bại)   | Không tạo bản ghi ghi danh; học viên thấy thông báo lý do                                                  |
| Ràng buộc            | Mỗi học viên chỉ ghi danh một khóa **một lần**, chặn bằng ràng buộc duy nhất `(user_id, course_id)` ở CSDL |
