// AI-assisted [AI-21] [AI-22] [AI-23]
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { groupLessonsByChapter } from '../../utils/chapters';
import { plainLessonTitle } from './lessonTitle';

const LockIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true" fill="currentColor">
    <path d="M8 0a5 5 0 0 0-5 5v2H2.5A1.5 1.5 0 0 0 1 8.5v8A1.5 1.5 0 0 0 2.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 13.5 7H13V5a5 5 0 0 0-5-5Zm3 7H5V5a3 3 0 1 1 6 0v2Z" />
  </svg>
);

const Chevron = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="ht-chapter__chevron">
    <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Học tuần tự (giống F8): bài học nhóm theo chương, mỗi chương gập / mở được.
// Trạng thái mỗi bài luôn có chữ + ký hiệu (Đang học / ✓ Đã học / 🔒 Đang khóa), không chỉ dùng màu.
// Figma "HT-05 · Trang học · v2 (chương học)": thẻ chương, thẻ "Lesson row", hộp nhắc "Bài đang khóa".
// Mục lục dài thì chia trang, mỗi trang 8 bài
const LESSONS_PER_PAGE = 8;

function LessonSidebar({ courseId, chapters, lessons, completed, isLocked, currentLessonId, linkState }) {
  const [open, setOpen] = useState(false); // điện thoại: mở / gập cả mục lục
  // Chương người dùng tự gập / mở; mặc định chỉ mở chương chứa bài đang học
  const [toggled, setToggled] = useState({});
  const [lockedHint, setLockedHint] = useState(null); // bài khóa vừa bấm -> hiện lời nhắc ngay dưới
  // Trang người dùng tự chọn, gắn với bài đang học: chuyển sang bài khác thì tự về trang chứa bài đó
  const [picked, setPicked] = useState({ lessonId: null, page: 1 });

  const groups = groupLessonsByChapter(lessons, chapters);
  const hasChapters = groups.some((g) => g.chapter);
  const currentKey = groups.find((g) => g.items.some(({ lesson }) => lesson.id === currentLessonId))?.key;

  // Phân trang theo đúng thứ tự bài hiển thị trong mục lục (đã nhóm theo chương)
  const order = new Map(groups.flatMap((g) => g.items).map(({ lesson }, pos) => [lesson.id, pos]));
  const totalPages = Math.max(1, Math.ceil(order.size / LESSONS_PER_PAGE));
  const currentPage = Math.floor((order.get(currentLessonId) ?? 0) / LESSONS_PER_PAGE) + 1;
  const page = Math.min(picked.lessonId === currentLessonId ? picked.page : currentPage, totalPages);
  const goToPage = (next) => setPicked({ lessonId: currentLessonId, page: next });
  const first = (page - 1) * LESSONS_PER_PAGE;
  const last = Math.min(first + LESSONS_PER_PAGE, order.size);
  const onPage = ({ lesson }) => {
    const pos = order.get(lesson.id);
    return pos >= first && pos < last;
  };

  // Trang chứa bài đang học: chỉ mở chương của bài đó; trang khác: mở hết để thấy bài
  const isGroupOpen = (key) => !hasChapters || (toggled[key] ?? (page !== currentPage || key === currentKey));
  const toggleGroup = (key) => setToggled((prev) => ({ ...prev, [key]: !isGroupOpen(key) }));

  const renderLesson = ({ lesson, index }) => {
    const locked = isLocked(index);
    const done = completed.has(lesson.id);
    const current = lesson.id === currentLessonId;
    const number = index + 1;

    let status;
    if (current) status = <span className="ht-lesson-item__status is-current">Đang học</span>;
    else if (done) status = <span className="ht-lesson-item__status is-done">✓ Đã học</span>;
    else if (locked) status = <span className="ht-lesson-item__status"><LockIcon /> Đang khóa</span>;
    else status = <span className="ht-lesson-item__status is-next">Học tiếp</span>;

    // Trạng thái nằm dưới tên bài (chỗ dòng "18 phút" của Figma) để tên bài có đủ chiều ngang,
    // tên dài tối đa 2 hàng, phần còn lại "…" và xem đủ khi rê chuột (title)
    const title = plainLessonTitle(lesson.title);
    const body = (
      <>
        <span className="ht-lesson-item__num" aria-hidden="true">{done && !current ? '✓' : number}</span>
        <span className="ht-lesson-item__text">
          <span className="ht-lesson-item__title" title={title}>
            <span className="visually-hidden">Bài {number}: </span>
            {title}
          </span>
          {status}
        </span>
      </>
    );

    if (locked) {
      const showHint = lockedHint === lesson.id;
      return (
        <li key={lesson.id}>
          <button
            type="button"
            className="ht-lesson-item is-locked"
            aria-disabled="true"
            aria-describedby={showHint ? `locked-hint-${lesson.id}` : undefined}
            onClick={() => setLockedHint(showHint ? null : lesson.id)}
          >
            {body}
          </button>
          {showHint && (
            <p id={`locked-hint-${lesson.id}`} className="ht-locked-hint" role="status">
              <LockIcon /> Hoàn thành bài trước để mở khóa bài này
            </p>
          )}
        </li>
      );
    }

    return (
      <li key={lesson.id}>
        <NavLink
          to={`/courses/${courseId}/learn/${lesson.id}`}
          replace
          state={linkState}
          className={`ht-lesson-item${current ? ' is-current' : ''}${done ? ' is-done' : ''}`}
          aria-current={current ? 'page' : undefined}
        >
          {body}
        </NavLink>
      </li>
    );
  };

  return (
    <nav className="ht-learn-toc" aria-label="Nội dung khóa học">
      {/* Điện thoại: nút gập / mở mục lục (Figma Mobile "Nội dung khóa học (4/10)") */}
      <button
        type="button"
        className="ht-learn-toc__toggle"
        aria-expanded={open}
        aria-controls="ht-learn-toc-list"
        onClick={() => setOpen(!open)}
      >
        {/* Tiến độ x/y đã có ở thanh ngay phía trên nên nút chỉ ghi tổng số bài */}
        <span>Nội dung khóa học – {lessons.length} bài</span>
        <Chevron />
      </button>
      <h2 className="ht-learn-toc__title">
        Nội dung khóa học <span className="ht-learn-toc__total">– {lessons.length} bài</span>
      </h2>

      <div id="ht-learn-toc-list" className={`ht-learn-toc__list${open ? ' is-open' : ''}`}>
        {groups.map((group) => {
          const pageItems = group.items.filter(onPage);
          if (!pageItems.length) return null; // chương không có bài nào ở trang này
          const groupOpen = isGroupOpen(group.key);
          const done = group.items.filter(({ lesson }) => completed.has(lesson.id)).length;
          const items = <ul className="ht-lesson-items">{pageItems.map(renderLesson)}</ul>;
          if (!hasChapters) return <div key={group.key}>{items}</div>;

          // Chương bị chia sang trang sau thì ghi "(tiếp)" để người học biết vẫn là chương cũ
          const continued = pageItems[0] !== group.items[0];
          const title = `${group.chapter ? `Chương ${group.number}: ${group.chapter.title}` : 'Bài học chưa phân chương'}${continued ? ' (tiếp)' : ''}`;
          return (
            <section key={group.key} className="ht-chapter-group">
              <button
                type="button"
                className={`ht-chapter${groupOpen ? ' is-open' : ''}`}
                aria-expanded={groupOpen}
                onClick={() => toggleGroup(group.key)}
              >
                <Chevron />
                <span className="ht-chapter__title">{title}</span>
                <span className="ht-chapter__count" aria-label={`Đã học ${done} trên ${group.items.length} bài`}>
                  {done}/{group.items.length}
                </span>
              </button>
              {groupOpen && items}
            </section>
          );
        })}

        {totalPages > 1 && (
          <div className="ht-toc-pager" role="group" aria-label="Phân trang nội dung khóa học">
            <button
              type="button"
              className="ht-toc-pager__btn"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Trang trước"
            >
              ‹
            </button>
            <span className="ht-toc-pager__info" aria-live="polite">
              Bài {first + 1}–{last} · Trang {page}/{totalPages}
            </span>
            <button
              type="button"
              className="ht-toc-pager__btn"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        )}

        <Link to={`/courses/${courseId}/quiz`} className="ht-btn ht-btn--secondary ht-learn-toc__quiz">
          Làm bài kiểm tra cuối khóa
        </Link>
      </div>
    </nav>
  );
}

export default LessonSidebar;
