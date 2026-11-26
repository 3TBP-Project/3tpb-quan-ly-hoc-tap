/**
 * [HT-04] Công thức tính % tiến độ học tập.
 * % tiến độ = số bài học đã hoàn thành / tổng số bài học của khóa.
 * Trả về số nguyên 0–100 (làm tròn gần nhất). Khóa chưa có bài học => 0%.
 */
export function calcProgressPercent(completedCount, totalCount) {
  const completed = Number(completedCount);
  const total = Number(totalCount);
  if (!Number.isFinite(completed) || !Number.isFinite(total)) return 0;
  if (total <= 0) return 0;
  const safeCompleted = Math.min(Math.max(0, completed), total);
  return Math.min(100, Math.max(0, Math.round((safeCompleted / total) * 100)));
}

/**
 * Gắn completedLessonCount + progressPercent vào object khóa học.
 * Luôn tính lại % khi có completedCount truyền vào hoặc completedLessonCount > 0.
 */
export function withCourseProgress(course = {}, completedCount) {
  const lessonCount = Number(course.lessonCount) || 0;
  const rawCompleted =
    completedCount ??
    course.completedLessonCount ??
    (Array.isArray(course.completedLessonIds) ? course.completedLessonIds.length : 0);
  const completedLessonCount = Math.min(Math.max(0, Number(rawCompleted) || 0), lessonCount);

  const progressPercent =
    completedCount != null || completedLessonCount > 0 || typeof course.progressPercent !== 'number'
      ? calcProgressPercent(completedLessonCount, lessonCount)
      : Math.min(100, Math.max(0, Math.round(course.progressPercent)));

  return { ...course, lessonCount, completedLessonCount, progressPercent };
}