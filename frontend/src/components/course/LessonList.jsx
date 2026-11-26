// AI-assisted [AI-17] [AI-23]
import { useRef, useState } from 'react';
import Pagination from '../common/Pagination';
import { groupLessonsByChapter, groupTitle } from '../../utils/chapters';

const LockIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
    <path d="M4 8V5.5a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="1" y="7" width="14" height="11" rx="3" fill="currentColor" />
  </svg>
);

// Danh sách dài thì chia trang, mỗi trang 8 bài (giống mục lục ở trang học)
const LESSONS_PER_PAGE = 8;

// Danh sách bài học ở trang chi tiết khóa học (Figma "Lesson row"), nhóm theo chương nếu khóa học có chương
function LessonList({ lessons, chapters, unlocked }) {
  const [page, setPage] = useState(1);
  const topRef = useRef(null);

  if (!lessons.length) return <p className="ht-body-muted">Khóa học chưa có bài học.</p>;

  const groups = groupLessonsByChapter(lessons, chapters);
  const hasChapters = groups.some((g) => g.chapter);

  // Phân trang theo đúng thứ tự bài hiển thị (đã nhóm theo chương)
  const order = new Map(groups.flatMap((g) => g.items).map(({ lesson }, pos) => [lesson.id, pos]));
  const totalPages = Math.max(1, Math.ceil(order.size / LESSONS_PER_PAGE));
  const current = Math.min(page, totalPages);
  const first = (current - 1) * LESSONS_PER_PAGE;
  const onPage = ({ lesson }) => {
    const pos = order.get(lesson.id);
    return pos >= first && pos < first + LESSONS_PER_PAGE;
  };

  const changePage = (next) => {
    setPage(next);
    // Đưa đầu danh sách vào tầm nhìn, không cuộn cả trang lên đầu
    topRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

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

  const pager = totalPages > 1 && (
    <div className="ht-lesson-pager">
      <p className="ht-caption ht-lesson-pager__info" aria-live="polite">
        Bài {first + 1}–{Math.min(first + LESSONS_PER_PAGE, order.size)} trên {order.size} bài
      </p>
      <Pagination page={current} totalPages={totalPages} onPageChange={changePage} />
    </div>
  );

  if (!hasChapters) {
    return (
      <div ref={topRef} className="ht-lesson-paged">
        <ol className="ht-lesson-list" start={first + 1}>
          {groups[0].items.filter(onPage).map((item) => renderLesson(item, item.index + 1))}
        </ol>
        {pager}
      </div>
    );
  }

  return (
    <div ref={topRef} className="ht-lesson-chapters">
      <p className="ht-caption ht-lesson-chapters__summary">
        {groups.filter((g) => g.chapter).length} chương · {lessons.length} bài học
      </p>
      {groups.map((group) => {
        const pageItems = group.items.filter(onPage);
        if (!pageItems.length) return null; // chương không có bài nào ở trang này
        // Chương bị chia sang trang sau thì ghi "(tiếp)"
        const continued = pageItems[0] !== group.items[0];
        return (
          <section key={group.key} className="ht-lesson-chapter">
            <div className="ht-lesson-chapter__head">
              <h3 className="ht-lesson-chapter__title">
                {groupTitle(group)}
                {continued && ' (tiếp)'}
              </h3>
              <span className="ht-caption">{group.items.length} bài</span>
            </div>
            <ol className="ht-lesson-list">
              {pageItems.map((item) => {
                const position = group.items.indexOf(item);
                return renderLesson(item, group.number ? `${group.number}.${position + 1}` : item.index + 1);
              })}
            </ol>
          </section>
        );
      })}
      {pager}
    </div>
  );
}

export default LessonList;
