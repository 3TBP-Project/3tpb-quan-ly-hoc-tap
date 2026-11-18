import { Col, Row } from 'react-bootstrap';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import PageHeader from '../components/common/PageHeader';
import CourseCard from '../components/course/CourseCard';
import { useFetch } from '../hooks/useFetch';
import { getMyCourses } from '../services/courseService';

function MyCoursesPage() {
  const { data: courses, loading, error } = useFetch(getMyCourses);

  if (loading && !courses) return <Loading />;

  return (
    <>
      <PageHeader
        title="Khóa học của tôi"
        subtitle="Danh sách các khóa học bạn đã ghi danh thành công."
      />
      {error ? (
        <ErrorMessage message={error} />
      ) : courses?.length ? (
        <Row xs={1} sm={2} md={3} xl={4} className="g-3">
          {courses.map((course) => (
            <Col key={course.id}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState message="Bạn chưa ghi danh khóa học nào." />
      )}
    </>
  );
}

export default MyCoursesPage;
