// AI-assisted [AI-13]
import { useState } from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
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
  const { data, loading, error, status } = useFetch(getLearnData, { courseId: id });
  const [doneIds, setDoneIds] = useState([]); // bài vừa đánh dấu trong phiên
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (loading) return <Loading />;
  if (status === 403) {
    return <Navigate to={`/courses/${id}`} replace state={{ notice: 'Bạn cần ghi danh để vào học.' }} />;
  }
  if (status === 404) return <NotFoundPage />;
  if (error) return <ErrorMessage message={error} />;

  const { course, lessons } = data;
  if (!lessons.length) return <ErrorMessage message="Khóa học chưa có bài học." />;
  if (!lessonId) return <Navigate to={`/courses/${id}/learn/${lessons[0].id}`} replace />;

  const index = lessons.findIndex((l) => l.id === Number(lessonId));
  if (index === -1) return <NotFoundPage />;

  const lesson = lessons[index];
  const completed = new Set([...data.completedLessonIds, ...doneIds]);
  const percent = Math.round((completed.size / lessons.length) * 100);

  const handleComplete = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await completeLesson(lesson.id);
      setDoneIds((ids) => [...ids, lesson.id]);
    } catch (err) {
      setSaveError(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="text-break">
          <Link to={`/courses/${id}`} className="small">‹ Thoát</Link>
          <h1 className="h5 mb-0">{course.title}</h1>
        </div>
        <div className="flex-grow-1 flex-md-grow-0" style={{ minWidth: 220 }}>
          <small className="text-muted">Tiến độ: {completed.size}/{lessons.length} bài ({percent}%)</small>
          <ProgressBar now={percent} />
        </div>
      </div>

      <Row className="g-4">
        <Col lg={3} className="order-last order-lg-first">
          <LessonSidebar courseId={id} lessons={lessons} completed={completed} />
        </Col>
        <Col lg={9}>
          {saveError && <Alert variant="danger">{saveError}</Alert>}
          <LessonContent lesson={lesson} />
          <LessonNav
            courseId={id}
            prev={lessons[index - 1]}
            next={lessons[index + 1]}
            isCompleted={completed.has(lesson.id)}
            saving={saving}
            onComplete={handleComplete}
          />
        </Col>
      </Row>
    </>
  );
}

export default LearnPage;