// AI-assisted [AI-09]
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, loading, error, status } = useFetch(getCourseById, { id });
  const [justEnrolled, setJustEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

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
      <Button variant="link" className="px-0 mb-3" onClick={() => navigate(-1)}>← Quay lại</Button>
      <Row className="g-4">
        <Col lg={8}>
          <Badge bg="primary" className="mb-2">{course.categoryName}</Badge>
          <h1 className="h3">{course.title}</h1>
          <p className="text-muted">Giảng viên: {course.teacherName}</p>
          <h2 className="h5 mt-4">Mô tả</h2>
          <p>{course.description}</p>
          <h2 className="h5 mt-4">Danh sách bài học ({course.lessons.length})</h2>
          <LessonList lessons={course.lessons} unlocked={isEnrolled} />
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