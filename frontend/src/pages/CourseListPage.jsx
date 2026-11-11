import { mockCourses } from '../mocks/course';
import { Row, Col } from 'react-bootstrap';
import CourseCard from '../components/course/CourseCard';

function CourseListPage() {
  return (
    <>
      <h1 className="h3 mb-4">Danh sách khóa học</h1>;

      <Row xs={1} sm={2} md={3} className="g-3">
        {mockCourses.map((course) => (
          <Col key={course.id}>
            <CourseCard course={course} />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default CourseListPage;
