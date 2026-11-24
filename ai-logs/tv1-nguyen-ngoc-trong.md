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

# [AI-06] Xem lại bài làm cũ (vì sao được bấy nhiêu điểm) – HT-07
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Lập trình, Kiểm thử
    - 24/11/2026
- Task / Commit / PR: HT-07 / f55c40a, 5fb2bae, d85d931, 29809db, 57f489c, b434981 / nhánh feature/HT-07-xem-lai-bai-lam
- Mục đích: Học viên mở lại bài trắc nghiệm đã nộp, xem từng câu mình chọn gì và đáp án đúng (giống Azota)
- Prompt chính: "tạo thêm chức năng hồ sơ trong học viên (lịch sử làm bài) thêm cái trang là xem bài cũ của mình tại sao được nhiêu đó điểm (theo ảnh 2_ Web azota). Nếu liên quan đến cơ sở dữ liệu thì tạo thêm nửa nha"
- Kết quả AI trả về (tóm tắt): Thêm bảng quiz_attempt_answers (lưu nội dung câu, thứ tự 4 lựa chọn, đáp án chọn, đáp án đúng); lưu thứ tự lựa chọn lúc bắt đầu và chi tiết khi nộp trong một transaction; API GET /api/quizzes/attempts/:attemptId chỉ chủ lượt xem được; trang QuizReviewPage (bảng câu hỏi, lọc Đúng/Sai/Bỏ trống, phiếu A-B-C-D); nút "Xem bài làm" trong lịch sử; seed chi tiết cho các lượt mẫu
- Đánh giá: Đúng - lượt làm trước khi có tính năng chỉ xem được điểm tổng (có thông báo rõ)
- Đã chỉnh sửa gì: Kiểm tra lại giao diện trên trình duyệt, yêu cầu đổi màu khung đáp án (AI-13)
- Cách kiểm chứng: Unit test quizService (lưu chi tiết, xem lại bài, chặn xem bài người khác), mở thử trang xem bài của tài khoản student5
- Tỷ lệ mã AI còn giữ lại (ước lượng): 95%
- Điều học được: Nên lưu "ảnh chụp" câu hỏi lúc làm bài để giảng viên sửa câu hỏi sau này cũng không làm sai bài cũ

# [AI-07] Hiển thị ảnh đại diện ở mọi nơi – HT-07
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-07 / c37c1e0, eb88a61, 5012c46, 70ef778, d236c3a / nhánh feature/HT-07-anh-dai-dien
- Mục đích: Avatar chỉ hiện ở trang hồ sơ, các chỗ khác (thẻ khóa học, header, trang quản trị) đang để vòng tròn trắng
- Prompt chính: "Hiển thị toàn bộ avatar (hiện tại chỉ có hồ sơ học viên với giảng viên mới hiện được). Còn những chỗ khác đang để là nền trắng mặc dù có avatar rồi"
- Kết quả AI trả về (tóm tắt): Component UserAvatar dùng chung (ảnh hoặc chữ cái đầu, tự xử lý ảnh lỗi); API trả thêm teacherAvatar/avatar; gắn avatar vào header, thẻ khóa học, chi tiết khóa học, quản lý người dùng, duyệt khóa học
- Đánh giá: Đúng
- Đã chỉnh sửa gì: Không
- Cách kiểm chứng: Kiểm tra API /api/courses trả teacherAvatar, xem trên trình duyệt ở trang khóa học và trang quản trị
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Gom phần hiển thị dùng chung thành một component để không phải sửa nhiều nơi

# [AI-08] Hộp thoại xác nhận nộp bài ở giữa màn hình – HT-06
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-06 / a0dfc04, e223d56 / nhánh feature/HT-06-hop-thoai-nop-bai
- Mục đích: Thay alert của trình duyệt bằng thông báo ở giữa màn hình khi còn câu chưa làm
- Prompt chính: "sửa cho mình cái giao diện hay vì xuất hiện alert thì xuất hiện cái thông báo ở giữa nha"
- Kết quả AI trả về (tóm tắt): Modal react-bootstrap căn giữa, liệt kê số câu chưa làm (bấm để quay lại câu đó), nút "Tiếp tục làm bài" được focus sẵn, hết giờ thì tự đóng hộp thoại và nộp
- Đánh giá: Đúng
- Đã chỉnh sửa gì: Không
- Cách kiểm chứng: Thử trên trình duyệt (giả lập API bắt đầu làm bài để không tốn lượt thật)
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: window.confirm chặn cả trang và không đổi được giao diện, nên dùng modal

# [AI-09] Chống lộ đáp án khi học viên còn lượt làm bài – HT-06
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Kiểm thử, Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-06 / ad973fa, 8104447, b347864 / nhánh fix/HT-06-an-dap-an-khi-con-luot
- Mục đích: Kiểm tra network khi làm bài có lộ đáp án không, và sửa lỗ hổng tìm được
- Prompt chính: "Kiểm tra giúp mình xem là có lộ đáp án ở network khi làm bài kiểm tra không", sau đó chọn "Ẩn đến hết 3 lượt"
- Kết quả AI trả về (tóm tắt): Lúc làm bài không lộ (API start chỉ trả id, nội dung, 4 lựa chọn đã xáo đều; học viên gọi API câu hỏi bị chặn). Nhưng sau khi nộp, API trả đáp án đúng mọi câu nên có thể nộp bài trắng lượt 1 để lấy đáp án. Sửa ở backend: còn lượt thì không trả đáp án đúng của câu sai/bỏ trống, dùng hết 3 lượt mới mở
- Đánh giá: Đúng - vẫn còn giới hạn: học viên biết câu nào đúng/sai nên có thể loại trừ dần
- Đã chỉnh sửa gì: Không
- Cách kiểm chứng: Unit test (ẩn khi còn lượt, mở khi hết lượt), gọi API thật với tài khoản mới dùng 1/3 lượt thấy correctAnswer = null
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Che dữ liệu phải làm ở server, giấu trên giao diện thì vẫn xem được ở tab Network

# [AI-10] Lượt làm bài bỏ dở không bị mất – HT-06
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Kiểm thử, Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-06 / d4c0689, e3aa4c0, 59732ec, dde6117 / nhánh fix/HT-06-luot-lam-bai-bo-do
- Mục đích: Đóng tab / F5 giữa chừng bị mất 1 lượt mà lịch sử không hiện (lỗi tìm được khi rà soát dự án)
- Prompt chính: "Bạn ơi kiểm tra giúp mình xem dự án này còn lỗi gì không", sau đó "Bạn sửa lỗi 2, 3 và 4 ở bên lỗi nghiêm trọng"
- Kết quả AI trả về (tóm tắt): Còn giờ thì bấm bắt đầu sẽ làm tiếp đúng lượt cũ (giữ giờ bắt đầu và thứ tự đáp án); quá giờ thì tự đóng 0 điểm, hiện "Bỏ dở" trong lịch sử; lưu tạm đáp án đang chọn trên trình duyệt để F5 không mất
- Đánh giá: Đúng
- Đã chỉnh sửa gì: Không
- Cách kiểm chứng: Unit test repository/service/lịch sử; gọi API lịch sử của student4 thấy 3/3 lượt có lượt "expired"
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Giới hạn số lượt phải đếm cùng một cách ở mọi nơi (bắt đầu làm bài, lịch sử)

# [AI-11] Kiểm tra dữ liệu đăng ký / đăng nhập – HT-03
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Kiểm thử, Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-03 / 57f4424, f05a680, 37d12b5, 1322f4a / nhánh fix/HT-03-kiem-tra-dang-ky-dang-nhap
- Mục đích: Gửi name/email là số làm server lỗi 500
- Prompt chính: "Bạn sửa lỗi 2, 3 và 4 ở bên lỗi nghiêm trọng"
- Kết quả AI trả về (tóm tắt): Kiểm tra kiểu chuỗi, độ dài tên/email tối đa 255, mật khẩu tối đa 72 byte (giới hạn bcrypt), đăng ký trùng email đồng thời trả 409
- Đánh giá: Đúng - lúc viết test AI để lọt một trường hợp hợp lệ nên đã ghi nhầm 1 tài khoản vào CSDL local; AI tự phát hiện, xóa đúng bản ghi đó và sửa test để chặn mọi lệnh ghi CSDL
- Đã chỉnh sửa gì: Không
- Cách kiểm chứng: 4 unit test mới, gọi API thật thấy trả 400 kèm thông báo rõ
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Unit test phải stub cả hàm ghi CSDL, không chỉ hàm đọc

# [AI-12] Ưu tiên dữ liệu server thay cho localStorage – HT-04
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-04 / 93401c9, 60e2b62 / nhánh fix/HT-04-uu-tien-du-lieu-server
- Mục đích: localStorage cũ làm hiện "đã ghi danh" sai, khóa học bị ẩn vẫn nằm trong "Khóa học của tôi"
- Prompt chính: "Bạn sửa lỗi 2, 3 và 4 ở bên lỗi nghiêm trọng"
- Kết quả AI trả về (tóm tắt): Khi gọi API thật thì chỉ dùng dữ liệu server, lỗi API thì hiện thông báo lỗi; localStorage chỉ dùng cho chế độ dữ liệu giả
- Đánh giá: Đúng
- Đã chỉnh sửa gì: Không
- Cách kiểm chứng: Build frontend, lint
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Server là nguồn sự thật, dữ liệu lưu ở trình duyệt dễ bị cũ

# [AI-13] Màu khung đáp án trang xem lại bài – HT-07
- Người dùng: Nguyễn Ngọc Trọng
- Công cụ: Claude Code - (Opus 5.5)
- Giai đoạn - Thời Gian:
    - Lập trình
    - 24/11/2026
- Task / Commit / PR: HT-07 / c57601d, e3f1cbf / nhánh feature/HT-07-mau-khung-dap-an
- Mục đích: Khung A-B-C-D đang màu đỏ, đổi sang xanh dương đậm; nhãn "Đáp án đúng:" rút gọn thành "Đáp án:"
- Prompt chính: "Chỗ Đáp án đúng:A đó bạn thì chỉ cần để đáp án và màu xanh dương đậm là đc rồi sửa cái khung là màu xanh dương đậm đi"
- Kết quả AI trả về (tóm tắt): Đổi màu chữ và viền khung sang #1e3a8a, áp dụng cho mọi câu
- Đánh giá: Đúng
- Đã chỉnh sửa gì: Lần đầu AI để xanh nhạt, mình yêu cầu đổi sang xanh đậm
- Cách kiểm chứng: Xem trên trình duyệt
- Tỷ lệ mã AI còn giữ lại (ước lượng): 100%
- Điều học được: Màu đỏ nên để báo sai, khung trung tính dùng màu chủ đạo
