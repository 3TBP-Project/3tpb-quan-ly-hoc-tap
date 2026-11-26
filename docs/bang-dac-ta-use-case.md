# Bảng đặc tả use case – 12 chức năng bắt buộc (mức B)

Đồ án Lập trình Web · Đề tài **Quản lý học tập** · Nhóm 2

| Mã UC | Mã chức năng | Tên use case                | Tác nhân                 |
| ----- | ------------ | --------------------------- | ------------------------ |
| UC01  | HT-01        | Xem danh sách khóa học      | Khách vãng lai, Học viên |
| UC02  | HT-02        | Xem chi tiết khóa học       | Khách vãng lai, Học viên |
| UC03  | HT-03        | Đăng ký, đăng nhập          | Khách vãng lai, mọi người dùng |
| UC04  | HT-04        | Ghi danh, khóa học của tôi  | Học viên                 |
| UC05  | HT-05        | Học bài                     | Học viên                 |
| UC06  | HT-06        | Làm bài trắc nghiệm         | Học viên                 |
| UC07  | HT-07        | Hồ sơ và kết quả học tập    | Học viên                 |
| UC08  | HT-09        | Quản lý khóa học            | Giảng viên               |
| UC09  | HT-10        | Quản lý bài học             | Giảng viên               |
| UC10  | HT-11        | Quản lý câu hỏi trắc nghiệm | Giảng viên               |
| UC11  | HT-14        | Quản lý người dùng          | Quản trị viên            |
| UC12  | HT-15        | Danh mục và duyệt khóa học  | Quản trị viên            |

## UC01 – Xem danh sách khóa học (HT-01)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Khách vãng lai, Học viên |
| Mô tả           | Xem các khóa học đang công khai, tìm kiếm và lọc khóa học |
| Điều kiện trước | Không có |
| Luồng chính     | 1. Người dùng vào trang chủ.<br>2. Hệ thống hiển thị các khóa học công khai, mỗi trang 9 khóa.<br>3. Người dùng nhập từ khóa hoặc chọn danh mục, giảng viên.<br>4. Hệ thống hiển thị các khóa phù hợp.<br>5. Người dùng chọn một khóa để xem chi tiết. |
| Ngoại lệ        | Không có khóa phù hợp: hệ thống báo không tìm thấy khóa học. |
| Kết quả         | Người dùng thấy danh sách khóa học đúng điều kiện tìm kiếm |
| Ràng buộc       | Chỉ hiện khóa học công khai và có ít nhất một bài học công khai |

## UC02 – Xem chi tiết khóa học (HT-02)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Khách vãng lai, Học viên |
| Mô tả           | Xem thông tin khóa học trước khi ghi danh |
| Điều kiện trước | Khóa học tồn tại và đang công khai |
| Luồng chính     | 1. Người dùng chọn một khóa học.<br>2. Hệ thống hiển thị tên, mô tả, giảng viên, danh mục, số học viên và danh sách tiêu đề bài học.<br>3. Hệ thống hiển thị nút **Ghi danh** (chưa ghi danh) hoặc **Vào học** (đã ghi danh). |
| Ngoại lệ        | Khóa học không tồn tại, đang nháp hoặc bị ẩn: hệ thống hiển thị trang không tìm thấy. |
| Kết quả         | Người dùng thấy thông tin khóa học |
| Ràng buộc       | Chỉ hiện tiêu đề bài học, không hiện nội dung bài khi chưa ghi danh (HT-NFR2) |

## UC03 – Đăng ký, đăng nhập (HT-03)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Khách vãng lai (đăng ký); Học viên, Giảng viên, Quản trị viên (đăng nhập) |
| Mô tả           | Khách tạo tài khoản học viên; người dùng đăng nhập vào hệ thống |
| Điều kiện trước | Đăng ký: email chưa được dùng. Đăng nhập: đã có tài khoản |
| Luồng chính     | **Đăng ký:**<br>1. Khách nhập họ tên, email, mật khẩu.<br>2. Hệ thống kiểm tra dữ liệu và email chưa tồn tại.<br>3. Hệ thống tạo tài khoản vai trò học viên.<br>**Đăng nhập:**<br>4. Người dùng nhập email, mật khẩu.<br>5. Hệ thống kiểm tra thông tin và trạng thái tài khoản.<br>6. Hệ thống cho đăng nhập và chuyển đến trang theo vai trò. |
| Ngoại lệ        | Email đã tồn tại; sai email hoặc mật khẩu; tài khoản bị khóa: hệ thống báo lỗi và không cho tiếp tục. |
| Kết quả         | Tài khoản được tạo / người dùng đăng nhập thành công |
| Ràng buộc       | Đăng ký công khai chỉ tạo tài khoản học viên; mật khẩu được mã hóa bằng bcrypt. Tài khoản giảng viên do quản trị cấp |

## UC04 – Ghi danh, khóa học của tôi (HT-04)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Học viên |
| Mô tả           | Học viên ghi danh khóa học và xem các khóa đã ghi danh |
| Điều kiện trước | Học viên đã đăng nhập; khóa học đang công khai |
| Luồng chính     | 1. Học viên bấm **Ghi danh** ở trang chi tiết khóa học.<br>2. Hệ thống kiểm tra khóa học và học viên chưa ghi danh.<br>3. Hệ thống lưu ghi danh, nút đổi thành **Vào học**.<br>4. Học viên vào **Khóa học của tôi** để xem các khóa đã ghi danh và tiến độ. |
| Ngoại lệ        | Khách chưa đăng nhập: chuyển sang trang đăng nhập. Đã ghi danh rồi: hệ thống báo đã ghi danh. |
| Kết quả         | Khóa học xuất hiện trong **Khóa học của tôi** với tiến độ 0% |
| Ràng buộc       | Mỗi học viên chỉ ghi danh một khóa một lần |

## UC05 – Học bài (HT-05)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Học viên |
| Mô tả           | Học viên học bài và đánh dấu hoàn thành để cập nhật tiến độ |
| Điều kiện trước | Học viên đã ghi danh khóa học |
| Luồng chính     | 1. Học viên bấm **Vào học**.<br>2. Hệ thống hiển thị danh sách chương, bài học và bài đang học.<br>3. Học viên xem nội dung, video, tải tài liệu PDF.<br>4. Học viên bấm **Đánh dấu hoàn thành**.<br>5. Hệ thống lưu tiến độ và mở bài tiếp theo. |
| Ngoại lệ        | Chưa ghi danh: hệ thống chặn và đưa về trang chi tiết khóa học. Chưa học xong bài trước: bài sau bị khóa. |
| Kết quả         | Học viên học được bài; tiến độ khóa học tăng |
| Ràng buộc       | Chỉ học viên đã ghi danh xem được nội dung (HT-NFR2); học theo thứ tự; video chỉ nhúng link (HT-NFR4) |

## UC06 – Làm bài trắc nghiệm (HT-06)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Học viên |
| Mô tả           | Học viên làm bài trắc nghiệm có giới hạn thời gian và được chấm điểm tự động |
| Điều kiện trước | Học viên đã ghi danh; khóa học có câu hỏi và thời gian làm bài; còn lượt làm |
| Luồng chính     | 1. Học viên bấm **Bắt đầu làm bài**.<br>2. Hệ thống kiểm tra số lượt, ghi giờ bắt đầu và gửi đề (không kèm đáp án đúng).<br>3. Học viên chọn đáp án trong thời gian cho phép.<br>4. Học viên bấm **Nộp bài** trước khi hết giờ.<br>5. Hệ thống kiểm tra thời gian, chấm điểm và lưu kết quả.<br>6. Học viên xem điểm lần này, điểm cao nhất và có thể xem lại bài làm. |
| Ngoại lệ        | Hết 3 lượt: không cho làm tiếp. Hết giờ mà chưa nộp: giao diện khóa bài làm, không gửi bài và báo bài không được ghi nhận; lượt đó vẫn tính vào 3 lượt và được hệ thống tự đóng ("Bỏ dở"). Nộp quá giờ (gọi API sau hạn): server từ chối, bài không được tính điểm. |
| Kết quả         | Lượt làm bài và điểm được lưu |
| Ràng buộc       | Tối đa 3 lượt mỗi khóa, lấy điểm cao nhất. Chấm điểm và tính giờ ở server (HT-NFR1) |

## UC07 – Hồ sơ và kết quả học tập (HT-07)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Học viên |
| Mô tả           | Học viên cập nhật thông tin cá nhân và xem lịch sử làm bài |
| Điều kiện trước | Học viên đã đăng nhập |
| Luồng chính     | 1. Học viên vào trang **Hồ sơ**.<br>2. Học viên sửa họ tên, đổi ảnh đại diện hoặc đổi mật khẩu.<br>3. Hệ thống kiểm tra và lưu thay đổi.<br>4. Học viên mở **Lịch sử làm bài**.<br>5. Hệ thống hiển thị các lượt làm bài theo từng khóa kèm điểm cao nhất. |
| Ngoại lệ        | Nhập sai mật khẩu hiện tại: hệ thống không cho đổi mật khẩu. |
| Kết quả         | Thông tin hồ sơ được cập nhật; học viên xem được kết quả học tập |
| Ràng buộc       | Không đổi được email; đổi mật khẩu phải nhập đúng mật khẩu cũ |

## UC08 – Quản lý khóa học (HT-09)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Giảng viên |
| Mô tả           | Giảng viên tạo, sửa, xóa và công khai khóa học của mình |
| Điều kiện trước | Giảng viên đã đăng nhập |
| Luồng chính     | 1. Giảng viên mở trang quản lý khóa học.<br>2. Giảng viên tạo khóa học mới (tên, mô tả, danh mục, ảnh bìa); khóa mới ở trạng thái nháp.<br>3. Giảng viên sửa thông tin khóa học.<br>4. Khi đã có bài học công khai, giảng viên chuyển khóa sang công khai.<br>5. Giảng viên xóa khóa học chưa có học viên. |
| Ngoại lệ        | Sửa/xóa khóa của giảng viên khác: bị chặn. Xóa khóa đã có học viên: bị chặn. |
| Kết quả         | Khóa học được lưu đúng thay đổi |
| Ràng buộc       | Giảng viên chỉ thao tác trên khóa của mình, kiểm tra ở server (HT-NFR3) |

## UC09 – Quản lý bài học (HT-10)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Giảng viên |
| Mô tả           | Giảng viên thêm, sửa, xóa và sắp xếp chương, bài học trong khóa học của mình |
| Điều kiện trước | Giảng viên đã đăng nhập; khóa học do giảng viên đó tạo |
| Luồng chính     | 1. Giảng viên chọn khóa học cần quản lý bài học.<br>2. Giảng viên thêm chương và bài học (tiêu đề, nội dung, link video, tệp PDF).<br>3. Giảng viên sửa, xóa hoặc đổi thứ tự bài học.<br>4. Giảng viên chuyển bài học từ nháp sang công khai. |
| Ngoại lệ        | Thiếu tiêu đề, tệp không phải PDF hoặc quá 5 MB: hệ thống báo lỗi. Thao tác trên khóa người khác: bị chặn. |
| Kết quả         | Danh sách bài học hiển thị đúng thay đổi |
| Ràng buộc       | PDF tối đa 5 MB; video chỉ lưu link (HT-NFR4); chỉ thao tác trên khóa của mình (HT-NFR3) |

## UC10 – Quản lý câu hỏi trắc nghiệm (HT-11)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Giảng viên |
| Mô tả           | Giảng viên soạn câu hỏi trắc nghiệm và đặt thời gian làm bài |
| Điều kiện trước | Giảng viên đã đăng nhập; khóa học do giảng viên đó tạo |
| Luồng chính     | 1. Giảng viên chọn khóa học.<br>2. Giảng viên đặt thời gian làm bài (phút).<br>3. Giảng viên thêm câu hỏi gồm nội dung, 4 lựa chọn và 1 đáp án đúng.<br>4. Giảng viên sửa hoặc xóa câu hỏi. |
| Ngoại lệ        | Thiếu lựa chọn, 2 lựa chọn trùng nhau hoặc chưa chọn đáp án đúng: hệ thống không cho lưu. |
| Kết quả         | Câu hỏi và thời gian làm bài được lưu |
| Ràng buộc       | Mỗi câu đúng 4 lựa chọn khác nhau, 1 đáp án đúng; chỉ sửa câu hỏi của khóa mình (HT-NFR3) |

## UC11 – Quản lý người dùng (HT-14)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Quản trị viên |
| Mô tả           | Quản trị viên cấp tài khoản giảng viên, khóa/mở khóa và xóa tài khoản |
| Điều kiện trước | Quản trị viên đã đăng nhập |
| Luồng chính     | 1. Quản trị viên mở trang quản lý người dùng, tìm hoặc lọc theo vai trò.<br>2. Quản trị viên tạo tài khoản giảng viên với mật khẩu tạm.<br>3. Quản trị viên khóa hoặc mở khóa tài khoản.<br>4. Quản trị viên xóa tài khoản không còn sử dụng. |
| Ngoại lệ        | Email đã tồn tại: không tạo được. Xóa giảng viên đang có khóa học: bị chặn. Tự khóa chính mình: bị chặn. |
| Kết quả         | Tài khoản được tạo, khóa/mở khóa hoặc xóa |
| Ràng buộc       | Tài khoản bị khóa không đăng nhập được; giảng viên phải đổi mật khẩu tạm khi đăng nhập lần đầu |

## UC12 – Danh mục và duyệt khóa học (HT-15)

| Mục             | Nội dung |
| --------------- | -------- |
| Tác nhân        | Quản trị viên |
| Mô tả           | Quản trị viên quản lý danh mục và ẩn khóa học vi phạm |
| Điều kiện trước | Quản trị viên đã đăng nhập |
| Luồng chính     | 1. Quản trị viên thêm, sửa, xóa danh mục khóa học.<br>2. Quản trị viên xem danh sách tất cả khóa học.<br>3. Quản trị viên ẩn khóa học vi phạm.<br>4. Khi khóa học đã được xử lý, quản trị viên bỏ ẩn. |
| Ngoại lệ        | Tên danh mục trùng: không lưu được. Xóa danh mục đang có khóa học: bị chặn. |
| Kết quả         | Danh mục được cập nhật; khóa học bị ẩn không còn hiện với học viên |
| Ràng buộc       | Chỉ quản trị viên được ẩn / bỏ ẩn khóa học |
