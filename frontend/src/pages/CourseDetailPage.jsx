// AI-assisted [AI-09]
import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/useAuth';
import { getCourseById, enrollCourse } from '../services/courseService';
import { parseApiError } from '../utils/apiError';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import LessonList from '../components/course/LessonList';
import EnrollButton from '../components/course/EnrollButton';
import NotFoundPage from './NotFoundPage';
import UserAvatar from '../components/common/UserAvatar';

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, loading, error, status } = useFetch(getCourseById, { id });
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const { state } = useLocation();

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollError('');
    try {
      await enrollCourse(id);
      setJustEnrolled(true);
    } catch (err) {
      setEnrollError(parseApiError(err).message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Loading />;
  if (status === 404) return <NotFoundPage />;
  if (error) return <ErrorMessage message={error} />;
  if (!course) return <Loading />;

  const isEnrolled = course.isEnrolled || justEnrolled;

  return (
    <>
      <Button variant="link" className="px-0 mb-3" onClick={() => navigate('/', { replace: true })}>← Quay lại</Button>
      {state?.notice && <Alert variant="warning">{state.notice}</Alert>}
      <Row className="g-4">
        <Col lg={8}>
          <Badge bg="primary" className="mb-2">{course.categoryName}</Badge>
          <h1 className="h3">{course.title}</h1>
          <div className="d-flex align-items-center gap-2 text-muted mb-3">
            <UserAvatar name={course.teacherName} avatar={course.teacherAvatar} role="teacher" size={36} />
            <span>Giảng viên: <span className="text-body fw-semibold">{course.teacherName}</span></span>
          </div>
          <h2 className="h5 mt-4">Mô tả</h2>
          <p>{course.description}</p>
          <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
            <h2 className="h5 mb-0">Danh sách bài học ({course.lessons.length})</h2>
            {/* Chỉ giảng viên sở hữu khóa học mới thấy (route quản lý bài học dành cho giảng viên) */}
            {user?.role === 'teacher' && Number(user.id) === Number(course.teacherId) && (
              <Link to={`/teacher/courses/${course.id}/lessons`} className="btn btn-outline-primary btn-sm">
                Quản lý bài học
              </Link>
            )}
          </div>
          <LessonList lessons={course.lessons} chapters={course.chapters} unlocked={isEnrolled} />
        </Col>
        <Col className="order-first order-lg-last">
          <img src={course.coverImage} alt={course.title} className="img-fluid rounded mb-3" />
          <p className="mb-3">
            {course.studentCount + (justEnrolled ? 1 : 0)} học viên · {course.lessons.length} bài học
          </p>
          {enrollError && <Alert variant="danger">{enrollError}</Alert>}
          <EnrollButton user={user} courseId={course.id} isEnrolled={isEnrolled}
                        enrolling={enrolling} onEnroll={handleEnroll} />
        </Col>
      </Row>
    </>
  );
}

export default CourseDetailPage;