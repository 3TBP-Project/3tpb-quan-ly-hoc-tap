// AI-assisted [AI-17]
import { groupLessonsByChapter, groupTitle } from '../../utils/chapters';

const LockIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
    <path d="M4 8V5.5a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="1" y="7" width="14" height="11" rx="3" fill="currentColor" />
  </svg>
);

// Danh sách bài học ở trang chi tiết khóa học (Figma "Lesson row"), nhóm theo chương nếu khóa học có chương
function LessonList({ lessons, chapters, unlocked }) {
  if (!lessons.length) return <p className="ht-body-muted">Khóa học chưa có bài học.</p>;

  const groups = groupLessonsByChapter(lessons, chapters);
  const hasChapters = groups.some((g) => g.chapter);

  const renderLesson = ({ lesson }, label) => (
    <li key={lesson.id} className="ht-lesson-row">
      <span className="ht-lesson-row__number">{label}</span>
      <span className="ht-lesson-row__title">{lesson.title}</span>
      {!unlocked && (
        <span className="ht-lesson-row__status ht-caption">
          <LockIcon />
          Cần ghi danh
        </span>
      )}
    </li>
  );

  if (!hasChapters) {
    return (
      <ol className="ht-lesson-list">
        {groups[0].items.map((item) => renderLesson(item, item.index + 1))}
      </ol>
    );
  }

  return (
    <div className="ht-lesson-chapters">
      <p className="ht-caption ht-lesson-chapters__summary">
        {groups.filter((g) => g.chapter).length} chương · {lessons.length} bài học
      </p>
      {groups.map((group) => (
        <section key={group.key} className="ht-lesson-chapter">
          <div className="ht-lesson-chapter__head">
            <h3 className="ht-lesson-chapter__title">{groupTitle(group)}</h3>
            <span className="ht-caption">{group.items.length} bài</span>
          </div>
          <ol className="ht-lesson-list">
            {group.items.map((item, position) =>
              renderLesson(item, group.number ? `${group.number}.${position + 1}` : item.index + 1),
            )}
          </ol>
        </section>
      ))}
    </div>
  );
}

export default LessonList;
