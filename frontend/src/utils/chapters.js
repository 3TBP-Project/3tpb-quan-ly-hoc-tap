// AI-assisted
// Nhóm bài học theo chương để hiển thị (trang học, chi tiết khóa học, quản lý bài học).
//
// lessons:  danh sách bài theo đúng thứ tự học (server đã xếp theo chương rồi tới bài)
// chapters: danh sách chương của khóa học, theo thứ tự chương
// includeEmpty: hiện cả chương chưa có bài (dùng cho trang giảng viên)
//
// Trả về [{ key, chapter, number, items: [{ lesson, index }] }]
//   - index: vị trí của bài trong danh sách lessons gốc (dùng cho khóa bài tuần tự)
//   - number: số thứ tự chương hiển thị (1, 2, 3...), null với nhóm "chưa có chương"
// Khóa học không có chương nào: trả về một nhóm duy nhất với chapter = null.
export const NO_CHAPTER_KEY = 'no-chapter';

export function groupLessonsByChapter(lessons, chapters = [], { includeEmpty = false } = {}) {
  const safeChapters = Array.isArray(chapters) ? chapters : [];
  const byChapter = new Map(safeChapters.map((c) => [Number(c.id), []]));
  const noChapter = [];

  lessons.forEach((lesson, index) => {
    const chapterId = lesson.chapterId ?? lesson.chapter_id ?? null;
    const bucket = chapterId == null ? null : byChapter.get(Number(chapterId));
    (bucket || noChapter).push({ lesson, index });
  });

  if (safeChapters.length === 0) {
    return [{ key: NO_CHAPTER_KEY, chapter: null, number: null, items: noChapter }];
  }

  const groups = [];
  let number = 0;
  safeChapters.forEach((chapter) => {
    const items = byChapter.get(Number(chapter.id));
    if (!items.length && !includeEmpty) return;
    number += 1;
    groups.push({ key: `chapter-${chapter.id}`, chapter, number, items });
  });
  if (noChapter.length) {
    groups.push({ key: NO_CHAPTER_KEY, chapter: null, number: null, items: noChapter });
  }
  return groups;
}

// Tên nhóm hiển thị
export const groupTitle = (group) =>
  group.chapter ? `${group.number}. ${group.chapter.title}` : 'Bài học chưa phân chương';
