import { Alert, Col, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import PageHeader from '../components/common/PageHeader';
import SafeErrorBoundary from '../components/common/SafeErrorBoundary';
import CourseCard from '../components/course/CourseCard';
import CourseProgress from '../components/course/CourseProgress';
import { useFetch } from '../hooks/useFetch';
import { getMyCourses } from '../services/courseService';
import { withCourseProgress } from '../utils/progress';

function MyCoursesPage() {
  const { data: courses, loading, error } = useFetch(getMyCourses);
  // Thông báo khi bị đẩy ra khỏi trang học (vd. khóa học vừa chuyển về bản nháp)
  const { state } = useLocation();
  const safeCourses = Array.isArray(courses) ? courses.filter((c) => c && c.id != null) : [];

  if (loading && safeCourses.length === 0) return <Loading />;

  return (
    <SafeErrorBoundary>
      <PageHeader
        title="Khóa học của tôi"
        subtitle="Danh sách các khóa học bạn đã ghi danh thành công."
      />
      {state?.notice && <Alert variant="warning">{state.notice}</Alert>}
      {error && safeCourses.length === 0 ? (
        <ErrorMessage message={error} />
      ) : safeCourses.length > 0 ? (
        <Row xs={1} sm={2} md={3} xl={4} className="g-3">
          {safeCourses.map((course) => (
            <Col key={course.id}>
              <CourseCard course={course}>
                <CourseProgress
                  completedCount={course.completedLessonCount}
                  totalCount={course.lessonCount}
                  progressPercent={course.progressPercent}
                />
              </CourseCard>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState message="Bạn chưa ghi danh khóa học nào." />
      )}
    </SafeErrorBoundary>
  );
}

export default MyCoursesPage;