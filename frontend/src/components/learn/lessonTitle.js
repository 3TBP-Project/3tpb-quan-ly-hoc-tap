// AI-assisted [AI-21]
// Tên bài không kèm tiền tố "Bài 3:" / "Bài 3." (giao diện đã tự đánh số bài),
// tránh hiện lặp "Bài 3 · Bài 3: ..." khi giảng viên đặt tên bài có sẵn số.
export const plainLessonTitle = (title = '') =>
  String(title).replace(/^\s*bài\s*\d+\s*[:.\-–·]\s*/i, '').trim() || String(title);
