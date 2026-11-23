/**
 * [HT-04] Lưu tiến độ học (bài đã hoàn thành) ở client để chế độ mock / F5
 * vẫn hiển thị đúng % tiến độ trên trang "Khóa học của tôi".
 * Backend thật là nguồn chính; storage này chỉ dùng khi VITE_USE_MOCK != false.
 */
const STORAGE_PREFIX = 'course_progress_v1_';

function getUserKey() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const uid = user?.id ?? user?.user_id ?? user?.email;
    return uid != null ? String(uid) : 'guest';
  } catch {
    return 'guest';
  }
}

function readAll() {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${getUserKey()}`);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${getUserKey()}`, JSON.stringify(data));
  } catch {
    // Bỏ qua lỗi quota để không làm sập trang
  }
}

const toIdList = (value) =>
  Array.isArray(value) ? value.map(Number).filter((n) => Number.isFinite(n)) : [];

/** Danh sách id bài học đã hoàn thành của 1 khóa. */
export function getCompletedLessonIds(courseId) {
  const all = readAll();
  return toIdList(all[String(courseId)]);
}

/** Đánh dấu 1 bài học đã hoàn thành (idempotent). */
export function saveCompletedLesson(courseId, lessonId) {
  const cid = String(courseId);
  const lid = Number(lessonId);
  if (!Number.isFinite(lid)) return;
  const all = readAll();
  const next = new Set(toIdList(all[cid]));
  next.add(lid);
  all[cid] = Array.from(next);
  writeAll(all);
}

/** Ghi đè toàn bộ danh sách hoàn thành của 1 khóa (dùng khi đồng bộ từ API). */
export function setCompletedLessons(courseId, lessonIds) {
  const all = readAll();
  all[String(courseId)] = toIdList(lessonIds);
  writeAll(all);
}

/** Map courseId -> số bài đã hoàn thành (dùng để tính % cho danh sách khóa học). */
export function getCompletedCountMap() {
  const all = readAll();
  const map = new Map();
  Object.entries(all).forEach(([courseId, ids]) => {
    map.set(Number(courseId), toIdList(ids).length);
  });
  return map;
}
