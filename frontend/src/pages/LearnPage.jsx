// AI-assisted [AI-13]
import { useState } from 'react';
import { Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { useFetch } from '../hooks/useFetch';
import { getLearnData, completeLesson } from '../services/lessonService';
import { parseApiError } from '../utils/apiError';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import LessonSidebar from '../components/learn/LessonSidebar';
import LessonContent from '../components/learn/LessonContent';
import LessonNav from '../components/learn/LessonNav';
import NotFoundPage from './NotFoundPage';

function LearnPage() {
  const { id, lessonId } = useParams();
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
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="text-break">
          <Button variant="link" size="sm" className="p-0 small" onClick={handleExit}>‹ Thoát</Button>
          <h1 className="h5 mb-0">{course.title}</h1>
        </div>
        <div className="flex-grow-1 flex-md-grow-0" style={{ minWidth: 220 }}>
          <small className="text-muted">Tiến độ: {completed.size}/{lessons.length} bài ({percent}%)</small>
          <ProgressBar now={percent} />
        </div>
      </div>

      <Row className="g-4">
        <Col lg={3} className="order-last order-lg-first">
          <LessonSidebar
            courseId={id}
            chapters={data.chapters}
            currentLessonId={lesson.id}
            lessons={lessons}
            completed={completed}
            isLocked={isLocked}
            linkState={lessonLinkState}
          />
        </Col>
        <Col lg={9}>
          {location.state?.lockedNotice && (
            <Alert variant="warning">
              Bài học đó đang bị khóa. Hãy hoàn thành bài này trước để mở khóa bài tiếp theo.
            </Alert>
          )}
          {saveError && <Alert variant="danger">{saveError}</Alert>}
          {waitingContent ? <Loading /> : <LessonContent lesson={lesson} />}
          <LessonNav
            courseId={id}
            prev={lessons[index - 1]}
            next={lessons[index + 1]}
            isCompleted={completed.has(lesson.id)}
            saving={saving}
            onComplete={handleComplete}
            linkState={lessonLinkState}
          />
        </Col>
      </Row>
    </>
  );
}

export default LearnPage;