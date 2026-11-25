// AI-assisted [AI-15] [AI-21]
import { Link } from 'react-router-dom';
import { plainLessonTitle } from './lessonTitle';

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 18" aria-hidden="true" fill="currentColor">
    <path d="M8 0a5 5 0 0 0-5 5v2H2.5A1.5 1.5 0 0 0 1 8.5v8A1.5 1.5 0 0 0 2.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 13.5 7H13V5a5 5 0 0 0-5-5Zm3 7H5V5a3 3 0 1 1 6 0v2Z" />
  </svg>
);

// Nút "Đánh dấu hoàn thành" + chuyển bài (Figma "Đánh dấu hoàn thành", "Hành động").
// Chuyển bài dùng replace để chỉ có 1 trang học trong lịch sử.
// Học tuần tự: chưa hoàn thành bài hiện tại thì nút "Bài sau" bị khóa, kèm lời nhắc.
function LessonNav({ courseId, prev, next, isCompleted, saving, onComplete, linkState }) {
  const link = (lesson) => `/courses/${courseId}/learn/${lesson.id}`;
  return (
    <div className="ht-lesson-nav">
      <button
        type="button"
        className={`ht-btn ${isCompleted ? 'ht-btn--done' : 'ht-btn--primary'} ht-lesson-nav__complete`}
        disabled={isCompleted || saving}
        onClick={onComplete}
      >
        {isCompleted ? '✓ Đã hoàn thành bài này' : saving ? 'Đang lưu...' : '✓ Đánh dấu hoàn thành bài này'}
      </button>

      <div className="ht-lesson-nav__row">
        <div className="ht-lesson-nav__prev">
          {prev && (
            <Link to={link(prev)} replace state={linkState} className="ht-btn ht-btn--secondary" title={prev.title}>
              ‹ <span className="ht-lesson-nav__label">Bài trước<span className="ht-lesson-nav__name">: {plainLessonTitle(prev.title)}</span></span>
            </Link>
          )}
        </div>

        {next && (
          <div className="ht-lesson-nav__next">
            {isCompleted ? (
              <Link to={link(next)} replace state={linkState} className="ht-btn ht-btn--secondary" title={next.title}>
                <span className="ht-lesson-nav__label">Bài sau<span className="ht-lesson-nav__name">: {plainLessonTitle(next.title)}</span></span> ›
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="ht-btn ht-btn--locked"
                  disabled
                  aria-describedby="ht-next-hint"
                  title={next.title}
                >
                  <span className="ht-lesson-nav__label">Bài sau<span className="ht-lesson-nav__name">: {plainLessonTitle(next.title)}</span></span> ›
                </button>
                <p id="ht-next-hint" className="ht-lesson-nav__hint">
                  <LockIcon /> Đánh dấu hoàn thành để mở bài tiếp theo
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonNav;
