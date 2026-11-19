const STORAGE_PREFIX = 'enrolled_courses_v2_';

const getUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const uid = user?.id ?? user?.user_id ?? user?.email;
    return uid != null ? String(uid) : 'guest';
  } catch {
    return 'guest';
  }
};

const readListByKey = (key) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id != null) : [];
  } catch {
    return [];
  }
};

// Lấy toàn bộ danh sách khóa học đã ghi danh (không bị mất khi F5)
export function getSavedEnrolledCourses() {
  const userKey = getUserKey();
  const userCourses = readListByKey(userKey);
  if (userKey === 'guest') return userCourses;

  // Gộp thêm dữ liệu guest (nếu người dùng ghi danh trước lúc đồng bộ phiên)
  const guestCourses = readListByKey('guest');
  const map = new Map();
  [...userCourses, ...guestCourses].forEach((c) => map.set(Number(c.id), c));
  return Array.from(map.values());
}

// Kiểm tra 1 khóa học đã ghi danh chưa
export function isCourseEnrolledSaved(courseId) {
  const id = Number(courseId);
  return getSavedEnrolledCourses().some((c) => Number(c.id) === id);
}

// Lưu khóa học vào localStorage (lưu cả thông tin thẻ để F5 hiển thị ngay)
export function saveEnrolledCourse(courseOrId) {
  try {
    const courseObj =
      typeof courseOrId === 'object' && courseOrId !== null
        ? courseOrId
        : { id: Number(courseOrId) };

    const id = Number(courseObj.id);
    if (!Number.isFinite(id) || id <= 0) return;

    const userKey = getUserKey();
    const current = readListByKey(userKey);
    const existing = current.find((c) => Number(c.id) === id) || {};

    const merged = {
      id,
      title: courseObj.title || existing.title || `Khóa học #${id}`,
      coverImage: courseObj.coverImage || existing.coverImage || '/images/course-default.jpg',
      teacherName: courseObj.teacherName || existing.teacherName || 'Giảng viên',
      categoryName: courseObj.categoryName || existing.categoryName || '',
      lessonCount: courseObj.lessonCount ?? existing.lessonCount ?? 0,
    };

    const next = [merged, ...current.filter((c) => Number(c.id) !== id)];
    localStorage.setItem(`${STORAGE_PREFIX}${userKey}`, JSON.stringify(next));
  } catch {
    // Bỏ qua lỗi bộ nhớ trình duyệt để không làm sập trang
  }
}