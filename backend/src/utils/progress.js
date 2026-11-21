/**
 * Công thức tính % tiến độ học tập (HT-04).
 * % tiến độ = số bài học đã hoàn thành / tổng số bài học của khóa.
 * Trả về số nguyên 0–100, làm tròn gần nhất.
 */
function calcProgressPercent(completedCount, totalCount) {
  const completed = Number(completedCount);
  const total = Number(totalCount);
  if (!Number.isFinite(completed) || !Number.isFinite(total)) return 0;
  if (total <= 0) return 0;
  const safeCompleted = Math.min(Math.max(0, completed), total);
  return Math.min(100, Math.max(0, Math.round((safeCompleted / total) * 100)));
}

module.exports = { calcProgressPercent };
