// AI-assisted [AI-13] [AI-21]
import { useState } from 'react';
import { Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getLearnData, completeLesson } from '../services/lessonService';
import { parseApiError } from '../utils/apiError';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import LessonSidebar from '../components/learn/LessonSidebar';
import LessonContent from '../components/learn/LessonContent';
import LessonNav from '../components/learn/LessonNav';
import NotFoundPage from './NotFoundPage';
import { plainLessonTitle } from '../components/learn/lessonTitle';
import '../components/learn/learn.css';

// Chế độ tập trung: ẩn mục lục, chỉ còn vùng đọc; nhớ lựa chọn trên máy người dùng
const FOCUS_KEY = 'ht-learn-focus';
const readFocus = () => {
  try {
    return localStorage.getItem(FOCUS_KEY) === '1';
  } catch {
    return false;
  }
};

function LearnPage() {
  const { id, lessonId } = useParams();
  const [focus, setFocus] = useState(readFocus);
  const toggleFocus = () => {
    setFocus((on) => {
      try {
        localStorage.setItem(FOCUS_KEY, on ? '0' : '1');
      } catch {
        // trình duyệt chặn lưu trữ: vẫn đổi chế độ trong phiên
      }
      return !on;
    });
  };
  // reloadKey tăng sau khi hoàn thành bài để tải nội dung bài vừa được mở khóa
  const [reloadKey, setReloadKey] = useState(0);
  const { data, loading, error, status } = useFetch(getLearnData, { courseId: id, reloadKey });
  const [doneIds, setDoneIds] = useState([]); // bài vừa đánh dấu trong phiên
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  // Các lần chuyển bài thay thế trang hiện tại, nên chỉ có 1 trang học trong lịch sử.
  const fromCourseDetail = Boolean(location.state?.fromCourseDetail);
  const learnState = fromCourseDetail ? { fromCourseDetail: true } : null;
  const lessonLinkState = learnState;

  // Điều hướng tuyệt đối và thay thế trang học để không còn mục lịch sử nào
  // có thể lùi ngược lại các bài đã xem.
  const handleExit = () => {
    navigate(`/courses/${id}`, { replace: true });
  };

  // Giữ trang học khi tải lại cùng khóa học, chỉ hiện Loading khi chưa có dữ liệu của khóa này
  if (loading && (!data || String(data.course?.id) !== String(id))) return <Loading />;
  if (status === 403) {
    return <Navigate to={`/courses/${id}`} replace state={{ notice: 'Bạn cần ghi danh để vào học.' }} />;
  }
  // Khóa học đã chuyển về bản nháp / bị ẩn (hoặc không tồn tại): đẩy học viên ra ngoài
  if (status === 404) {
    return <Navigate to="/my-courses" replace state={{ notice: error }} />;
  }
  if (error) return <ErrorMessage message={error} />;

  const { course, lessons } = data;
  if (!lessons.length) return <ErrorMessage message="Khóa học chưa có bài học." />;

  const completed = new Set([...data.completedLessonIds, ...doneIds]);
  // Học tuần tự (giống F8): mở tới bài đầu tiên chưa hoàn thành, các bài sau bị khóa
  const firstIncomplete = lessons.findIndex((l) => !completed.has(l.id));
  const isLocked = (i) => firstIncomplete !== -1 && i > firstIncomplete;
  const resumeLesson = lessons[firstIncomplete === -1 ? 0 : firstIncomplete];

  // Vào học: mở tiếp bài đang học dở
  if (!lessonId) return <Navigate to={`/courses/${id}/learn/${resumeLesson.id}`} replace state={learnState} />;

  const index = lessons.findIndex((l) => l.id === Number(lessonId));
  if (index === -1) return <NotFoundPage />;
  // Gõ thẳng link bài đang khóa: đưa về bài cần học tiếp
  if (isLocked(index)) {
    return (
      <Navigate
        to={`/courses/${id}/learn/${resumeLesson.id}`}
        replace
        state={{ ...learnState, lockedNotice: true }}
      />
    );
  }

  const lesson = lessons[index];
  const percent = Math.round((completed.size / lessons.length) * 100);
  // Bài vừa mở khóa nhưng nội dung chưa tải về (server không gửi nội dung bài khóa)
  const waitingContent = Boolean(lesson.isLocked);

  const handleComplete = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await completeLesson(lesson.id);
      setDoneIds((ids) => [...ids, lesson.id]);
      setReloadKey((k) => k + 1);
    } catch (err) {
      const { message } = parseApiError(err);
      // Giảng viên vừa chuyển khóa học về nháp trong lúc học viên đang học
      if (err.response?.status === 404) {
        navigate('/my-courses', { replace: true, state: { notice: message } });
        return;
      }
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`ht-learn${focus ? ' is-focus' : ''}`}>
      {/* Thanh tiến độ tràn ngang dưới Header (Figma "Thanh tiến độ") */}
      <div className="ht-learn-bar">
        <nav className="ht-learn-bar__crumb" aria-label="Vị trí trang">
          <button type="button" className="ht-learn-bar__course" onClick={handleExit} title="Về trang khóa học">
            {course.title}
          </button>
          <span aria-hidden="true"> › </span>
          <span className="ht-learn-bar__lesson" aria-current="page">Bài {index + 1}: {plainLessonTitle(lesson.title)}</span>
        </nav>

        <div className="ht-learn-progress">
          <div className="ht-learn-progress__label">
            <span>Tiến độ khóa học</span>
            <strong>{completed.size}/{lessons.length} bài · {percent}%</strong>
          </div>
          <div
            className="ht-learn-progress__track"
            role="progressbar"
            aria-label="Tiến độ khóa học"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <button type="button" className="ht-btn ht-btn--ghost ht-learn-bar__focus" aria-pressed={focus} onClick={toggleFocus}>
          {focus ? 'Hiện mục lục' : 'Chế độ tập trung'}
        </button>
      </div>

      <div className="ht-learn-body">
        {!focus && (
          <aside className="ht-learn-side">
            <LessonSidebar
              courseId={id}
              chapters={data.chapters}
              currentLessonId={lesson.id}
              lessons={lessons}
              completed={completed}
              isLocked={isLocked}
              linkState={lessonLinkState}
            />
          </aside>
        )}

        <div className="ht-learn-main">
          {location.state?.lockedNotice && (
            <p className="ht-learn-alert is-warning" role="status">
              <span aria-hidden="true">⚠</span> Bài học đó đang bị khóa. Hãy hoàn thành bài này trước để mở khóa bài tiếp theo.
            </p>
          )}
          {saveError && (
            <p className="ht-learn-alert is-error" role="alert">
              <span aria-hidden="true">✕</span> {saveError}
            </p>
          )}
          {waitingContent ? <Loading /> : <LessonContent lesson={lesson} number={index + 1} />}
          <LessonNav
            courseId={id}
            prev={lessons[index - 1]}
            next={lessons[index + 1]}
            isCompleted={completed.has(lesson.id)}
            saving={saving}
            onComplete={handleComplete}
            linkState={lessonLinkState}
          />
        </div>
      </div>
    </div>
  );
}

export default LearnPage;