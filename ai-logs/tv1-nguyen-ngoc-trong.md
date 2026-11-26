<!-- Mẫu AI Logs
# [AI-<STT>] <Công việc anh em đang xử lý>
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: <Tên AI (Chatgpt)> - <Model(Sol6.1)>
- Giai đoạn - Thời Gian: 
<Thiết kế | Lập trình | Kiểm thử | Tài liệu>
<Ngày/Tháng/Năm>
- Task / Commit / PR: #23 / a1b2c3d / PR #15
- Mục đích: ...
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): ...
- Kết quả AI trả về (tóm tắt): ...
- Đánh giá: Đúng / Sai / Thiếu - vì sao
- Đã chỉnh sửa gì: ...
- Cách kiểm chứng: test nào, đối chiếu tài liệu nào
- Tỷ lệ mã AI còn giữ lại (ước lượng): ...%
- Điều học được: ..
 -->
# [AI-01] Tạo Bảng Use Case cho dự án
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - (Opus 5 - Medium)
- Giai đoạn - Thời Gian: 
    - Thiết kế
    - 11/11/11
- Task: Tạo Use Case Cho dự án (Tham khảo từ bảng đặc tả)
- Mục đích: Kiểm Tra Xem Định dạng use case có đúng ko
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
Bạn coi thử xem mình cần cải thiện gì không
- Kết quả AI trả về (tóm tắt):
Ba lỗi lớn đã sửa xong: cụm "Quản Lý" tách đúng thành ba use case riêng, mũi tên kế thừa giờ chỉ đúng chiều xuống Khách vãng lai, và các đường association đã bỏ mũi tên. Giờ khoảng **88%**.

Còn sót đúng một lỗi thật:

## "Làm Bài Tập Trắc Nghiệm" vẫn chưa nối vào Học Viên

Ô này vẫn lơ lửng, không có đường nào. Đây là HT-06, một trong 12 chức năng bắt buộc, và là chức năng phức tạp nhất đồ án — GV mà thấy nó không nối với ai sẽ hỏi ngay.

Kéo một đường từ Học Viên sang ô đó là xong. Nhân tiện đổi tên thành **"Làm bài trắc nghiệm"** — Đặc tả không có chữ "Tập", và "bài tập" với "bài kiểm tra" là hai thứ khác nhau.

## Ba điểm đánh bóng

**Đầu mũi tên kế thừa** nên là tam giác rỗng, hiện đang là mũi tên nhọn thường. Trong draw.io: chọn đường đó → panel phải → mục Đường thẳng → đổi đầu mũi tên sang kiểu block rỗng (hình tam giác trắng viền đen).

**Viết hoa:** đang lẫn hai kiểu — "Quản Lý Khóa Học" viết hoa mọi chữ, còn "Quản lý người dùng" thì không. Chọn một. Mình khuyên theo Đặc tả: chỉ hoa chữ đầu.

**Khoảng trắng giữa sơ đồ** vẫn rất rộng. Kéo cụm Giảng Viên lên gần cụm Học Viên, cụm Quản Trị Viên lên gần cụm Khách vãng lai, rồi thu khung hệ thống lại. In A4 sẽ dễ nhìn hơn nhiều.

## Nhắc lại chỗ hôm trước

Bốn chức năng mức C (HT-08 Hỏi đáp, HT-12 Theo dõi học viên, HT-13 Nhập câu hỏi từ tệp, HT-16 Thống kê) vẫn chưa có. Nếu cố ý bỏ thì thêm một dòng chú thích dưới khung để GV biết đó là lựa chọn, không phải sót:

> *Sơ đồ thể hiện 12 chức năng bắt buộc (mức B). 4 chức năng mức C sẽ bổ sung sau Mốc 2.*

Nối xong HT-06 là sơ đồ đủ chuẩn để bảo vệ Mốc 1.
- Đánh giá: Đúng (Khoảng 80% - Vì còn một số thứ không cần thiết cho bảng use case)
- Đã chỉnh sửa gì: bảng use case chỉnh sửa cho đúng định dạng
- Cách kiểm chứng: Hình ảnh từ Google
- Điều học được: Xác định đúng định dạng bảng use case

# [AI-02] Tạo Squenche diagram cho chức năng làm bài trắc nghiệm
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - Sonnet 5.5 (High)
- Giai đoạn - Thời Gian: 
    + Thiết kế 
    + 12/11/2026>
- Task: 
vẽ sequence diagram “Làm bài trắc nghiệm”: Học viên → QuizController.start (tạo lượt, ghi giờ bắt đầu, trả câu hỏi không kèm đáp án) → submit (kiểm tra giờ, chấm, lưu điểm) (thẻ [DOC] Sequence diagram, nhánh docs/sequence)
- Mục đích: Hiểu luồng chạy chức năng làm bài tập trắc nghiệm (Đang làm và đã hoàn thành)
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):Rồi bây giờ bạn tạo squenche diagram cái chức năng Làm bài trắc nghiệm”: Học viên → QuizController.start (tạo lượt, ghi giờ bắt đầu, trả câu hỏi không kèm đáp án) → submit (kiểm tra giờ, chấm, lưu điểm)
- Kết quả AI trả về (tóm tắt):
Mình dựng một sơ đồ duy nhất bám đúng mô tả trong PDF Ngày 3. Tên hàm giữ nguyên QuizController.start và QuizController.submit như đề ghi.

Mình đã gửi đủ 3 file, sơ đồ đi đúng luồng PDF mô tả:

sequence-lam-bai-trac-nghiem.png: ảnh để dán vào slide. Lần gửi đầu bị lỗi vì ảnh cao quá 8000 px, mình đã xuất lại ở kích thước nhỏ hơn và gửi được.
sequence-lam-bai-trac-nghiem.md: commit file này vào docs/, mở trên GitHub là sơ đồ tự hiện. Cuối file có bảng chỉ ra 3 điểm thực hiện HT-NFR1.
sequence-lam-bai-trac-nghiem.mmd: mã nguồn. Muốn sửa thì dán vào mermaid.live, hoặc trong draw.io chọn Bổ sung → Mermaid.

Mình đã kiểm tra cú pháp bằng trình đọc của Mermaid và tự xuất ảnh ra xem: sơ đồ hiển thị đúng, tiếng Việt có dấu không bị lỗi.

Commit theo đúng việc N3-TV1-01:

powershell
git checkout develop
git pull origin develop
git checkout -b docs/sequence
git add docs/sequence-lam-bai-trac-nghiem.md docs/sequence-lam-bai-trac-nghiem.mmd docs/sequence-lam-bai-trac-nghiem.png
git commit -m "docs: sequence diagram lam bai trac nghiem"
git push -u origin docs/sequence

Khi bảo vệ, chỉ vào 3 bước trên sơ đồ. Đây là 3 bước PDF yêu cầu:

Bước 22: server tự ghi started_at.
Bước 30: server xóa correct_option trước khi gửi câu hỏi xuống.
Bước 49 và 60: server tự tính thời gian đã làm và tự chấm điểm.

Đồng hồ đếm ngược ở bước 33 chỉ để học viên nhìn. Nếu GV hỏi “học viên sửa đồng hồ trên máy thì sao”, câu trả lời là server không dùng giờ của trình duyệt.

Việc còn lại là N3-TV1-02: đối chiếu tên hàm và tên cột với code của TV2. Tên QuizController.start và QuizController.submit mình giữ đúng như PDF ghi. Còn các tên findByIdWithCourse, findAnswerKey, findBestScore là mình tự đặt theo kiểu thường dùng, nên cần hỏi TV2 xem code thật đặt tên gì. Cột thời gian làm bài phải là quiz_minutes, khớp bản migration mình sửa lúc nãy. Nếu TV4 vẫn để quiz_duration thì hai bên sẽ lệch tên cột.
- Đánh giá: Sai (Chưa có hàm hay các trường hợp lỗi 404)
- Đã chỉnh sửa gì: Vẽ mọi thứ ở mức tổng quan
- Cách kiểm chứng: 
https://viblo.asia/p/so-do-sequence-diagram-tat-tan-tat-thong-tin-quan-trong-ban-can-nam-WR5JRBjAJGv
- Điều học được: Không cần tạo squenche quá phức tạp chỉ cần tạo để giải thích được luồng chạy của chức năng

# [AI-03] Tạo file moc-1 .md
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - Opus 5 (Medium)
- Giai đoạn - Thời Gian: 
Thiết kế
11/11/2026
- Task: 
N4-TV1-01 · Công việc: viết docs/moc-1.md: đề tài, công nghệ, kiến trúc, ERD, user story, kế hoạch S2
- Mục đích: Tổng hợp những công việc đã làm trong thời gian ở nhà
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
Công việc: viết docs/moc-1.md: đề tài, công nghệ, kiến trúc, ERD, user story,
Bây giờ bạn làm cái  viết mốc 1 rồi viết vào thành file markdown nha
- Kết quả AI trả về (tóm tắt):
Việc `N4-TV1-01`. Theo PDF, file này gom nội dung từ các tài liệu đã có, mỗi phần vài dòng kèm link tới file gốc — không chép lại toàn bộ.

Xong `moc-1.md`, lưu vào `docs/`. File viết theo kiểu PDF yêu cầu: mỗi phần tóm tắt vài dòng rồi dẫn link tới tài liệu gốc, không chép lại toàn bộ nội dung.

**Bốn chỗ bạn phải điền:**

1. **Số nhóm, ngày bảo vệ, link Trello** ở đầu file.
2. **Mục 8 – Kết quả Sprint S1.** Mình để trống vì không biết nhóm đã làm xong tới đâu. Mở Trello lướt một lượt rồi điền. Riêng dòng layout mình điền sẵn vì thấy PR #2 đã merge.
3. **Đường dẫn ở mục 12.** Mình viết theo tên file mà PDF các ngày quy định, nhưng nhóm có thể đặt khác. Mở thư mục `docs/` đối chiếu, file nào chưa có thì xóa dòng đó đi — để link gãy trong tài liệu nộp thì mất điểm oan.
4. **Mục 11 – thời lượng trình bày.** Mình chia 2+3+2+2+1 phút. Chỉnh lại nếu nhóm muốn khác.

**Ba chỗ mình chủ động đưa vào vì GV hay hỏi:**

Mục 5 có ba quyết định thiết kế kèm lý do: tách bảng `lesson_progress`, chặn ghi danh trùng bằng ràng buộc `UNIQUE`, và dùng `RESTRICT` thay vì `CASCADE` khi xóa danh mục. Đây là phần TV4 trình bày — câu hỏi "tại sao chọn cách này" là câu GV chắc chắn hỏi.

Mục 7 tóm tắt luồng HT-06 và nêu rõ vì sao học viên không gian lận được. Mục 10 là bảng rủi ro, PDF Ngày 1 yêu cầu phần này trong đề cương.

**Một chỗ cần kiểm tra lại với TV4.** Mục 5 mình ghi bảng `courses` có cột thời gian làm bài, nhưng migration bạn gửi chiều nay đặt tên là `quiz_duration`, trong khi ERD và sequence diagram dùng `quiz_minutes`. Hai bên phải thống nhất một tên trước khi nộp, nếu không GV đối chiếu tài liệu với code sẽ thấy lệch ngay.
- Đánh giá: Thiếu (Vì một số cái nhóm còn thiếu và chưa bàn luận đc)
- Đã chỉnh sửa gì: Không bổ sung: Sprint 2, Rủi ro
- Tỷ lệ AI còn giữ lại (ước lượng): 30%
- Điều học được: Tạo báo cáo mẫu cốc 1 để tổng hợp những việc đã làm và còn thiếu sót trong quá trình làm đồ án

# [AI-04] Bổ Sung thêm include và extend vào sơ đồ use case
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: claude - Opus 5.5
- Giai đoạn - Thời Gian: 
<Thiết kế>
<15/11/2026>
- Mục đích: Bổ sung các chức năng bao gồm các điều kiện trước đó và mở rộng
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
Bạn ơi bổ sung cho mình thêm include và extend đc ko  ní vẽ hẳn vô đây lun nha
Dựa trên file pdf lấy danh sách chức năng của dự án quản lý học tập bổ sung nha
- Kết quả AI trả về (tóm tắt):
Xong rồi ní, mình vẽ lại nguyên sơ đồ, giữ bố cục 4 actor như bản của bạn và thêm include/extend theo tiêu chí chấp nhận HT-01 → HT-15 (mức B) trong file PDF. Có 2 file: Use_Case_QLHT_include_extend.png để xem nhanh, Use_Case_QLHT_include_extend.drawio để mở bằng draw.io sửa tiếp.

Phần đã bổ sung:

Khách vãng lai: Danh sách khóa học ← «extend» Tìm theo tên, Lọc theo danh mục/giảng viên. Chi tiết khóa học → «include» Xem danh sách bài học.
Học viên:
Khóa học của tôi → «include» Xem tiến độ (%).
Học bài → «include» Xem nội dung, ← «extend» Đánh dấu hoàn thành, Chuyển bài trước/sau.
Làm trắc nghiệm → «include» Tính giờ, Chấm điểm tự động, ← «extend» Làm lại (tối đa 3 lần).
Hồ sơ ← «extend» Cập nhật thông tin, Đổi mật khẩu, Xem lịch sử làm bài.
Giảng viên: Thêm/Sửa/Xóa «extend» vào Quản lý khóa học, Quản lý bài học (thêm Sắp xếp thứ tự) và Quản lý câu hỏi (thêm Đặt thời gian làm bài). Tải PDF/link video «extend» vào Thêm bài học.
Quản trị viên:
Quản lý người dùng ← «extend» Tạo tài khoản giảng viên, Tìm kiếm, Khóa/mở khóa.
Danh mục & duyệt ← «extend» Thêm/Sửa/Xóa danh mục, Ẩn khóa học vi phạm.

Mình sửa luôn 3 lỗi trong bản cũ:

“Làm Bài Tập Trắc Nghiệm” chưa nối với Học viên. Mình đã nối vào.
Mũi tên Học viên → Khách vãng lai dùng sai đầu. Đây là quan hệ kế thừa (generalization), nên phải dùng tam giác rỗng chứ không phải mũi tên đặc.
Thêm use case “Khóa Học Của Tôi”. Trong đặc tả HT-04 có chức năng này nhưng bản cũ thiếu.

Cách nhớ chiều mũi tên: include đi từ use case gốc → phần bắt buộc, còn extend đi từ phần tùy chọn → use case gốc. Cả hai đều là nét đứt.

Mình chưa vẽ 4 chức năng mức C (HT-08, 12, 13, 16) cho đỡ rối. Nếu nhóm bạn làm phần cộng điểm thì nói mình thêm vô nha. Mình cũng không cho các use case «include» Đăng nhập, vì nhiều thầy cô coi đăng nhập là điều kiện tiên quyết chứ không phải include. Bạn nên hỏi lại thầy Tiến xem thầy muốn kiểu nào.
- Đánh giá: Đúng  (Vì bám sát những gì mà file đặc tả yêu cầu)
- Cách kiểm chứng: file đặc tả yêu cầu
- Điều học được: Học cách mở rộng và yêu cầu từng chức năng phải làm như thế nào

# [AI-05] Sửa usecase
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - Opus 5.5 (Medium)
- Giai đoạn - Thời Gian: 
Thiết kế
17/11/2026
- PR: #29 
- Mục đích: Sửa usecase ở những điểm thiếu sót
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại):
Bây giờ bạn vẽ lại use case giúp mình nha 12 chức năng bắt buộc thì là mỗi chức năng là use case (Viết theo động từ)
* Actor: Khách vẵng lai
   * Xem Danh Sách Khóa Học
      * Tìm theo tên khóa học
      * Lọc theo: danh mục, giảng viên
      * Chọn Phân trang 1,2,3,4,5
   * Xem Chi Tiết Khóa Học
      * Mô Tả (Nội dung khóa học)
      * Xem thông tin giảng viên ( avatar và tên giảng viên)
      * Xem Danh sách Bài học (Chưa xem được nội dung bài giảng, Tiêu đề đã đc phép coi rồi)
      * Hiện số lượng học viên đã đăng ký
   * Đăng ký, Đăng nhập tài khoản
* Actor: Học Viên
   * Ghi danh ,khóa học của tôi
      * Ghi danh (đăng ký) khóa học trên một tài khoản
      * Xem danh sách đã đăng ký khóa học (% tiến độ học)
   * Học bài
      * Xem nội dung bài học bằng văn bản, Tệp PDF
      * Coi video (Youtube)
      * Đánh dấu đã hoàn thành nội dung
      * Chuyển bài trước/ sau
   * Làm bài trắc nghiệm
      * Câu hỏi trắc nghiệm (4 đáp án - 1 đáp án đúng)
      * Giới hạn thời gian làm bài
      * Mỗi bài trắc nghiệm làm đc làm tối đa 3 lần (lấy điểm cao nhất)
   * Xem hồ sơ kết quả học tập
      * Sửa thông tin hồ sơ
      * Đổi mật khẩu tài khoản
      * Lịch sử làm bài và điểm số trên bài trắc nghiệm đó
   * Hỏi đáp trong học tập
      * Bình luận dưới bài học đó (Nội dung đang học)
      * Giảng viên trả lời bình luận đó
* Actor: Giảng Viên
   * Quản Lý Khóa Học
      * Tạo, Xem, xóa Sửa khóa học của mình ( Tiêu đề, Mô tả, Ảnh bìa, nháp bài viết, công khai)
   * Quản lý bài học
      * Tạo, Xem, Xóa, Sửa nội dung bài học (trong khóa học đó)
      *  Sắp xếp thứ tự theo nội dung 1.<...> 2.<....>
      *  Tải tệp nội dung pdf dưới 5MB trở xuống
   * Quản lý câu hỏi trắc nghiệm
      * Tạo danh sách câu hỏi và danh sách câu trả lời
      * Setup thời gian làm bài
   * Theo dõi học viên
      * Thêm danh sách câu hỏi thông qua file CSV/Execl mẫu
      * Thông báo lỗi nếu có
* Actor: Quản Trị
   * Quản Lý Người Dùng
      * Tạo tài khoản giảng viên
      * Tìm kiếm theo tên người dùng hoặc email
      * Trạng thái hoạt động hoặc bị chặn (khóa/mở khóa)
   * Danh Mục và duyệt khóa học
      * Tạo, xem, sửa, xóa danh mục
      * Ẩn khóa học bị vi phạm
- Kết quả AI trả về (tóm tắt):
Mình vẽ lại xong, gửi kèm hai file. Bản PNG mình đã mở ra xem, các đường nối không còn cắt ngang use case khác. File .drawio thì mình chỉ kiểm tra được là đúng định dạng, chưa mở thử trên draw.io. Nếu bạn mở ra thấy chỗ nào lệch thì báo mình.

Cách vẽ: mỗi chức năng là một use case chính, chữ in đậm, tên bắt đầu bằng động từ. Các ý con bạn liệt kê trở thành use case phụ:

«include» (xanh, gốc → phụ) cho phần luôn xảy ra. Ví dụ “Xem chi tiết khóa học” luôn hiện mô tả, giảng viên, danh sách bài học và số học viên.
«extend» (đỏ, phụ → gốc) cho phần người dùng chọn làm hay không. Ví dụ tìm theo tên, lọc, chuyển trang, các thao tác thêm/sửa/xóa.

Một số use case mình tách đôi để mỗi cái chỉ có một động từ:

HT-03 thành “Đăng ký tài khoản” và “Đăng nhập”.
HT-04 thành “Ghi danh khóa học” và “Xem khóa học của tôi” (có «include» “Xem tiến độ học tập (%)”).
HT-08 Hỏi đáp thành “Đặt câu hỏi trong bài học” của Học viên và “Trả lời câu hỏi của học viên” của Giảng viên.

Ba chỗ mình làm khác danh sách của bạn:

Danh sách có 14 chức năng, không phải 12. Hỏi đáp (HT-08) và mục “Theo dõi học viên” của bạn đều là chức năng mức C (cộng điểm). Mình vẫn vẽ cả hai, nhưng dùng elip nét đứt nền xám và ghi rõ trong chú thích, để GV thấy nhóm phân biệt được chức năng bắt buộc với chức năng cộng điểm.
Mục “Theo dõi học viên” mình đặt tên lại là “Nhập câu hỏi từ tệp”. Các ý con bạn ghi (nhập câu hỏi từ CSV/Excel, báo lỗi) là nội dung của HT-13. Còn HT-12 Theo dõi học viên trong Đặc tả là xem danh sách học viên kèm tiến độ, điểm và xuất CSV. Nếu nhóm định làm HT-12 thì báo mình, mình đổi lại.
Thêm “Chấm điểm tự động” vào HT-06. Ý này không có trong danh sách của bạn nhưng có trong Đặc tả, và là bước GV sẽ hỏi khi xem sequence diagram.

Ngoài ra mình sửa tên “Làm Bài Tập Trắc Nghiệm” thành “Làm bài trắc nghiệm” cho khớp Đặc tả. Mũi tên kế thừa (tam giác rỗng) từ Học viên chỉ về Khách vãng lai vẫn giữ như cũ.
- Đánh giá: THiếu Sót - (Có những use case không đúng định dạnh - Vòng use case sử dụng nét đứt ở chức năng mức C) và Lập usecase những chức năng mà nhóm em không hướng tới
- Đã chỉnh sửa gì: Chỉnh lại thành nét liền và
- Cách kiểm chứng: Tài liệu trên mạng
- Điều học được: Xây dựng và chỉnh sửa những điều thiếu sót ở usecase cũ

# [AI-06] Danh mục và duyệt khóa học – HT-15
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - (Opus 5.5)
- Giai đoạn - Thời Gian: 
    - Lập trình, Kiểm thử
    - 21/11/2026 – 25/11/2026
- Task / Commit / PR: HT-15 Danh mục và duyệt khóa học / `967c9a5`, `d0afcc5` / PR #52 (`feature/HT-15-danh-muc`)
- Ghi chú mã AI: comment trong code và trailer commit `967c9a5` đang ghi `[AI-07]`; mục này là log của mã đó, đánh số lại thành AI-14 vì AI-07 đã dùng cho việc khác trong log ngày 24/11
- Mục đích: Làm trọn chức năng quản trị danh mục khóa học và ẩn / bỏ ẩn khóa học vi phạm, từ API backend tới giao diện quản trị
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): [TV1 dán lại prompt gốc hoặc link hội thoại]
- Kết quả AI trả về (tóm tắt):
    - API quản trị `/api/admin/categories`: xem danh mục kèm số khóa học, thêm, sửa, xóa; chặn trùng tên.
    - Chặn xóa danh mục đang có khóa học, kiểm tra cả trong câu lệnh DELETE để tránh trường hợp khóa học được thêm cùng lúc.
    - API `/api/admin/courses`: xem tất cả khóa học, `PATCH .../hide` và `PATCH .../unhide`.
    - Khóa học bị ẩn không hiện ở danh sách công khai, trang chi tiết trả 404 (trừ giảng viên sở hữu); giảng viên không tự bỏ ẩn hay tự đặt trạng thái ẩn.
    - Trang `/admin/categories` gồm tab Danh mục khóa học và tab Duyệt khóa học.
    - Unit test `backend/test/catalog.test.js`: chặn xóa, trùng tên, ẩn / bỏ ẩn, phân quyền admin, lọc khóa học bị ẩn.
- Đánh giá: Đúng phần lớn. Bản đầu dùng thêm cột `courses.status_before_hidden` để bỏ ẩn thì khôi phục trạng thái cũ, cách này rườm rà so với nghiệp vụ
- Đã chỉnh sửa gì: Commit `d0afcc5` (25/11): ẩn khóa học đổi thẳng trạng thái sang `hidden`, bỏ ẩn đưa về `public` và chỉ cho bỏ ẩn khi khóa còn ít nhất một bài học công khai. Giao diện trang quản trị sau đó được TV3 làm lại theo mockup Figma (log của TV3, mã `[AI-28]`)
- Cách kiểm chứng: Chạy `npm test` trong `backend`; thử trên trình duyệt bằng tài khoản admin: thêm danh mục trùng tên, xóa danh mục đang có khóa học, ẩn khóa học rồi kiểm tra trang chủ và trang chi tiết; đối chiếu test case TC-29
- Tỷ lệ mã AI còn giữ lại (ước lượng): [..]%
- Điều học được: Kiểm tra điều kiện ngay trong câu lệnh SQL (xóa chỉ khi danh mục còn rỗng) an toàn hơn kiểm tra bằng một câu SELECT riêng trước đó

# [AI-07] Quản lý người dùng – HT-14
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude - (Opus 5.5)
- Giai đoạn - Thời Gian: 
    - Lập trình, Kiểm thử
    - 21/11/2026 – 22/11/2026
- Task / Commit / PR: HT-14 Quản lý người dùng / `6a256a8`, `09f16a7` / PR #53 (`feature/HT-14-quan-ly-nguoi-dung-v2`)
- Ghi chú mã AI: comment trong code và trailer commit đang ghi `[AI-08]`; mục này là log của mã đó, đánh số lại thành AI-15 vì AI-08 đã dùng cho việc khác trong log ngày 24/11
- Mục đích: Cho quản trị viên quản lý tài khoản học viên và giảng viên: cấp tài khoản giảng viên, sửa họ tên, khóa / mở khóa, xóa
- Prompt chính (nguyên văn hoặc link chia sẻ hội thoại): [TV1 dán lại prompt gốc hoặc link hội thoại]
- Kết quả AI trả về (tóm tắt):
    - `GET /api/admin/users`: lọc theo vai trò (học viên / giảng viên), tìm theo họ tên hoặc email, phân trang, đếm số lượng theo vai trò, số khóa ghi danh / giảng dạy, ngày đăng ký.
    - `POST /api/admin/users`: tạo tài khoản giảng viên, kiểm tra email, chặn trùng, băm mật khẩu tạm.
    - `PUT /api/admin/users/:id`: sửa họ tên (`{ name }`) hoặc khóa / mở khóa (`{ is_locked }`).
    - `DELETE /api/admin/users/:id`: ban đầu chỉ xóa giảng viên chưa có khóa học; tài khoản admin không nằm trong phạm vi quản lý.
    - Migration thêm cột `users.created_at`.
    - Trang `/admin/users`: bộ lọc vai trò, tìm kiếm, bảng có phân trang, hộp thoại thêm / sửa, xem hồ sơ, giao diện thẻ trên điện thoại.
    - Unit test `backend/test/userManagement.test.js`: tạo giảng viên, xóa, khóa / mở khóa, lọc danh sách, phân quyền.
- Đánh giá: Đúng, nhưng thiếu chức năng xóa tài khoản học viên
- Đã chỉnh sửa gì: Commit `09f16a7` (22/11): cho xóa cả tài khoản học viên (ghi danh, kết quả làm bài, tiến độ, bình luận, thảo luận bị xóa theo), hộp xác nhận cảnh báo mất dữ liệu học tập; giảng viên vẫn chỉ xóa được khi chưa có khóa học. Giao diện sau đó được TV3 làm lại theo mockup Figma (log của TV3, mã `[AI-27]`)
- Cách kiểm chứng: Chạy `npm test` trong `backend`; thử trên trình duyệt: tạo giảng viên trùng email, khóa một học viên rồi đăng nhập bằng tài khoản đó, xóa giảng viên đang có khóa học; đối chiếu test case TC-27, TC-28
- Tỷ lệ mã AI còn giữ lại (ước lượng): [..]%
- Điều học được: Không tin trạng thái trong JWT; mỗi request phải đọc lại trạng thái khóa trong CSDL thì tài khoản bị khóa mới bị chặn ngay. Xóa người dùng cần tính tới dữ liệu liên quan (khóa ngoại `CASCADE`)

# [AI-08] Viết bảng đặc tả use case cho 12 chức năng mức B
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian: 
    - Tài liệu
    - 25/11/2026
- Task / Commit / PR: Đặc tả use case (`docs/bang-dac-ta-use-case.md`) / chưa commit / chưa có PR
- Mục đích: Có bảng đặc tả use case cho 12 chức năng bắt buộc (HT-01 → HT-07, HT-09 → HT-11, HT-14, HT-15) để đưa vào báo cáo
- Prompt chính (nguyên văn):
    - Lần 1: "Bạn ơi dựa trên cái dựa án này (tất cả mọi thứ trên dựa án này) làm bảng use case cho 12 chức năng mức B (HT01 -> HT07, HT09->HT11, HT14 -> HT15) rồi ghi vào file với đường dẫn này "C:\idk\DAQLHT\n2\3tpb-quan-ly-hoc-tap\docs\bang-dac-ta-use-case.md""
    - Lần 2: "Bạn ơi chỉ cần kể luồng nghiệp vụ thực tế là đc rồi không cần quá chi tiết vậy đâu"
- Kết quả AI trả về (tóm tắt):
    - Lần 1: AI đọc tài liệu trong `docs/` và mã nguồn backend/frontend, viết 12 use case (UC01–UC12), mỗi use case gồm tác nhân, điều kiện trước, luồng chính, luồng ngoại lệ, kết quả, ràng buộc, kèm API và mã lỗi HTTP. AI phát hiện hai chỗ tài liệu cũ khác mã nguồn: bài nộp trễ không bị chấm 0 điểm mà bị từ chối, và khóa ngoại danh mục trong migration là `CASCADE` chứ không phải `RESTRICT`.
    - Lần 2: AI rút gọn lại, chỉ giữ luồng nghiệp vụ thực tế; bỏ API, mã lỗi, tên file.
- Đánh giá: Đúng, nhưng bản đầu quá chi tiết so với yêu cầu báo cáo nên phải yêu cầu rút gọn
- Đã chỉnh sửa gì: Yêu cầu AI rút gọn bản đặc tả còn luồng nghiệp vụ chính, ngoại lệ, kết quả, ràng buộc
- Cách kiểm chứng: Đối chiếu từng use case với đề cương, `docs/test-cases.md` và chạy thử các chức năng trên trình duyệt
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): ~90%
- Điều học được: Đặc tả use case trong báo cáo nên viết theo góc nhìn nghiệp vụ người dùng, không đưa chi tiết kỹ thuật (API, mã lỗi) vào

# [AI-09] Viết nháp chương 1 và chương 2 của báo cáo
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian: 
    - Tài liệu
    - 25/11/2026
- Task / Commit / PR: Báo cáo chương 1, 2 (`docs/bao-cao/chuong-01-gioi-thieu.md`, `docs/bao-cao/chuong-02-to-chuc-nhom.md`) / chưa commit / chưa có PR
- Mục đích: Có bản nháp chương 1 (Giới thiệu đề tài) và chương 2 (Tổ chức nhóm và quản lý dự án) theo đúng các mục bắt buộc trong mẫu báo cáo
- Prompt chính (nguyên văn): "Bạn ơi viết giùm mình nháp chương 1 và chương 2 (mỗi chương là một file .md) rồi tạo ra 2 file .md vào dự án nha ní đừng commit vội" (kèm ảnh chụp bảng yêu cầu nội dung chương 1, 2)
- Kết quả AI trả về (tóm tắt):
    - Chương 1: bối cảnh, lý do chọn đề tài; mục tiêu; phạm vi (bảng 4 phân hệ, 12 chức năng bắt buộc, chức năng cộng điểm, ngoài phạm vi); bố cục báo cáo.
    - Chương 2: vai trò thành viên; quy trình Scrum rút gọn và board Trello; bảng kế hoạch / thực tế 5 sprint (suy ra từ lịch sử commit và PR); tổng hợp retrospective; ma trận phân công và đánh giá.
    - AI đánh dấu `[Nháp]` / `[..]` ở các chỗ không có dữ liệu thật (ảnh Trello, ngày sprint, retrospective S5) và chỉ ra tên TV2/TV4 bị ghi ngược giữa đề cương và biên bản họp.
- Đánh giá: Đúng phần lớn, còn thiếu dữ liệu thật về Trello và ý kiến retrospective của thành viên
- Đã chỉnh sửa gì: [TV1 bổ sung: những phần đã sửa lại trong 2 chương]
- Cách kiểm chứng: Đối chiếu với `docs/de-cuong.md`, `docs/moc-1.md`, biên bản họp trong `docs/mettings/`, board Trello và lịch sử Git
- Tỷ lệ nội dung AI còn giữ lại (ước lượng): [..]%
- Điều học được: Tiến độ sprint có thể lấy bằng chứng từ lịch sử commit / PR; cần thống nhất thông tin thành viên giữa các tài liệu
