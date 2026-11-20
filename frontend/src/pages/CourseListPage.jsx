// AI-assisted [AI-08] [AI-14]
import { useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import CourseCard from '../components/course/CourseCard';
import CourseFilter from '../components/course/CourseFilter';
import { useFetch } from '../hooks/useFetch';
import { getCategories, getCourses, getTeachers } from '../services/courseService';

// 9 khóa mỗi trang (hướng dẫn Ngày 6). Đặt VITE_PAGE_SIZE nhỏ hơn để thử phân trang với dữ liệu giả.
const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_SIZE) || 9;
const EMPTY_FILTERS = { search: '', categoryId: '', teacherId: '' };

function CourseListPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [loginCourseId, setLoginCourseId] = useState(null);
  const { user } = useAuth();

  const courses = useFetch(getCourses, { ...filters, page, limit: PAGE_SIZE });
  const categories = useFetch(getCategories);
  const teachers = useFetch(getTeachers);

  const items = courses.data?.items ?? [];
  const total = courses.data?.total ?? 0;
  const totalPages = courses.data?.totalPages ?? 1;

  const handleFilterChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1); // đổi bộ lọc thì về trang đầu
  };

  // Khách chưa đăng nhập bấm vào thẻ: không chuyển trang, hiện thông báo đăng nhập
  const askLogin = (e, courseId) => {
    e.preventDefault();
    setLoginCourseId(courseId);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderList = () => {
    if (courses.error) return <ErrorMessage message={courses.error} />;
    if (courses.loading && !courses.data) return <Loading />;
    if (items.length === 0) return <EmptyState message="Không tìm thấy khóa học phù hợp." />;

    return (
      <Row xs={1} sm={2} md={3} xl={4} className="g-3">
        {items.map((course) => (
          <Col key={course.id}>
            {/* Bấm vào thẻ thì vào chi tiết; hai nút riêng cho chi tiết và làm bài kiểm tra */}
            <CourseCard course={course} onClick={user ? undefined : (e) => askLogin(e, course.id)}>
              <div className="d-flex gap-2">
                <Button as={Link} to={`/courses/${course.id}`} variant="outline-primary" size="sm" className="flex-fill">
                  Xem chi tiết
                </Button>
                <Button as={Link} to={`/courses/${course.id}/quiz`} variant="primary" size="sm" className="flex-fill">
                  Làm bài kiểm tra
                </Button>
              </div>
            </CourseCard>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <>
      <PageHeader
        title="Danh sách khóa học"
        subtitle={courses.data ? `Hiển thị ${items.length} trên tổng ${total} khóa học` : ' '}
      />

      <CourseFilter
        value={filters}
        categories={categories.data ?? []}
        teachers={teachers.data ?? []}
        onChange={handleFilterChange}
      />

      <div style={{ opacity: courses.loading && courses.data ? 0.5 : 1 }}>{renderList()}</div>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      <Modal show={loginCourseId !== null} onHide={() => setLoginCourseId(null)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title as="h2" className="h5">Cần đăng nhập</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-muted">Vui lòng đăng nhập để xem khóa học.</Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setLoginCourseId(null)}>Để sau</Button>
          <Button as={Link} to="/login" state={{ from: { pathname: `/courses/${loginCourseId}` } }} variant="primary">
            Đăng nhập
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CourseListPage;
