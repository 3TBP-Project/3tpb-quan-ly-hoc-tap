// AI-assisted [AI-08] [AI-14] [AI-16]
import { useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Pagination from '../components/common/Pagination';
import CourseCard from '../components/course/CourseCard';
import CourseFilter from '../components/course/CourseFilter';
import { useFetch } from '../hooks/useFetch';
import { getCategories, getCourses, getTeachers } from '../services/courseService';
import './CourseListPage.css';

// 9 khóa mỗi trang (hướng dẫn Ngày 6). Đặt VITE_PAGE_SIZE nhỏ hơn để thử phân trang với dữ liệu giả.
const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_SIZE) || 9;
const EMPTY_FILTERS = { search: '', categoryId: '', teacherId: '' };
// Khách vãng lai xem chi tiết tự do; chỉ làm bài kiểm tra (và ghi danh ở trang chi tiết) mới cần đăng nhập
const QUIZ_MSG = 'Vui lòng đăng nhập để làm bài kiểm tra.';

// "attempt" chỉ để bấm "Thử lại" thì gọi lại API, không gửi lên server
const fetchCourses = (params, signal) => {
  const query = { ...params };
  delete query.attempt;
  return getCourses(query, signal);
};

// Sticker trang trí ở khối giới thiệu (Figma "Minh họa sticker")
const INTRO_STICKERS = [
  { cat: 'lap-trinh', text: '</>', className: 'ht-intro__sticker--1' },
  { cat: 'thiet-ke', text: 'Aa', className: 'ht-intro__sticker--2' },
  { cat: 'du-lieu', text: '123', className: 'ht-intro__sticker--3' },
  { cat: 'marketing', text: '#', className: 'ht-intro__sticker--4' },
];

function CourseSkeleton() {
  return (
    <div className="ht-course-card ht-course-card--skeleton" aria-hidden="true">
      <span className="ht-skeleton ht-skeleton--cover" />
      <div className="ht-course-card__body">
        <span className="ht-skeleton" style={{ width: 88, height: 24 }} />
        <span className="ht-skeleton" style={{ width: '70%', height: 20 }} />
        <span className="ht-skeleton" style={{ width: '45%', height: 16 }} />
        <span className="ht-skeleton" style={{ width: '100%', height: 44, borderRadius: 14 }} />
      </div>
    </div>
  );
}

function ListState({ tone, title, message, children }) {
  return (
    <div className="ht-list-state" role={tone === 'error' ? 'alert' : 'status'}>
      <div className={`ht-list-state__art ht-list-state__art--${tone}`} aria-hidden="true">
        <span className="ht-list-state__sticker">
          {tone === 'error' ? (
            <strong>!</strong>
          ) : (
            <>
              <i style={{ width: 28 }} />
              <i style={{ width: 28 }} />
              <i style={{ width: 18 }} />
            </>
          )}
        </span>
      </div>
      <h3 className="ht-h3">{title}</h3>
      <p className="ht-body-muted">{message}</p>
      {children}
    </div>
  );
}

function CourseListPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  // Khách bấm vào khóa học: { path: trang muốn đến sau khi đăng nhập, message }
  const [loginPrompt, setLoginPrompt] = useState(null);
  const { user } = useAuth();

  const courses = useFetch(fetchCourses, { ...filters, page, limit: PAGE_SIZE, attempt });
  const categories = useFetch(getCategories);
  const teachers = useFetch(getTeachers);

  const items = courses.data?.items ?? [];
  const total = courses.data?.total ?? 0;
  const totalPages = courses.data?.totalPages ?? 1;

  const handleFilterChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1); // đổi bộ lọc thì về trang đầu
  };

  const clearFilters = () => handleFilterChange(EMPTY_FILTERS);

  // Khách chưa đăng nhập bấm vào nút: không chuyển trang, hiện thông báo đăng nhập
  const askLogin = (e, path, message) => {
    e.preventDefault();
    setLoginPrompt({ path, message });
  };
  const guestOnly = (path, message) => (user ? undefined : (e) => askLogin(e, path, message));
  // Chỉ học viên mới làm bài; khách vẫn thấy nút để được nhắc đăng nhập
  const canTakeQuiz = !user || user.role === 'student';

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const countText = () => {
    if (courses.error) return '';
    if (courses.loading && !courses.data) return 'Đang tải danh sách khóa học…';
    return `Hiển thị ${items.length} trên ${total} khóa học`;
  };

  const renderList = () => {
    if (courses.error) {
      return (
        <ListState
          tone="error"
          title="Không tải được danh sách khóa học"
          message={`${courses.error} Kiểm tra mạng rồi bấm “Thử lại”.`}
        >
          <button type="button" className="ht-btn ht-btn--secondary" onClick={() => setAttempt((n) => n + 1)}>
            Thử lại
          </button>
        </ListState>
      );
    }

    if (courses.loading && !courses.data) {
      return (
        <Row xs={1} md={2} lg={3} className="g-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Col key={i}>
              <CourseSkeleton />
            </Col>
          ))}
        </Row>
      );
    }

    if (items.length === 0) {
      return (
        <ListState
          tone="empty"
          title="Không tìm thấy khóa học phù hợp"
          message="Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm khóa học."
        >
          <button type="button" className="ht-btn ht-btn--primary" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </ListState>
      );
    }

    return (
      <Row xs={1} md={2} lg={3} className="g-4">
        {items.map((course) => (
          <Col key={course.id}>
            {/* Bấm vào thẻ thì vào chi tiết; hai nút riêng cho chi tiết và làm bài kiểm tra */}
            <CourseCard course={course}>
              <div className="ht-course-card__actions">
                <Link to={`/courses/${course.id}`} className="ht-btn ht-btn--secondary">
                  Xem chi tiết
                </Link>
                {canTakeQuiz && (
                  <Link
                    to={`/courses/${course.id}/quiz`}
                    onClick={guestOnly(`/courses/${course.id}/quiz`, QUIZ_MSG)}
                    className="ht-btn ht-btn--primary"
                  >
                    Làm bài kiểm tra
                  </Link>
                )}
              </div>
            </CourseCard>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="ht-home">
      <section className="ht-intro" aria-labelledby="ht-intro-title">
        <div className="ht-intro__text">
          <h1 id="ht-intro-title" className="ht-h1">
            Học vui, tiến bộ mỗi ngày
          </h1>
          <p className="ht-body">
            {/* Điện thoại dùng câu ngắn hơn (Figma M01) */}
            <span className="d-none d-md-inline">Chọn khóa học bạn thích, học</span>
            <span className="d-md-none">Học</span> từng bài ngắn rồi làm bài kiểm tra để biết mình tiến bộ
            đến đâu.
          </p>
        </div>
        <div className="ht-intro__art" aria-hidden="true">
          <span className="ht-intro__blob" />
          {INTRO_STICKERS.map((s) => (
            <span key={s.cat} className={`ht-intro__sticker ht-cat--${s.cat} ${s.className}`}>
              {s.text}
            </span>
          ))}
        </div>
      </section>

      <div className="ht-list-head">
        <h2 className="ht-h2">Danh sách khóa học</h2>
        <p className="ht-body-muted" aria-live="polite">
          {countText()}
        </p>
      </div>

      <CourseFilter
        value={filters}
        categories={categories.data ?? []}
        teachers={teachers.data ?? []}
        onChange={handleFilterChange}
      />

      <div className={courses.loading && courses.data ? 'ht-home__list is-refreshing' : 'ht-home__list'}>
        {renderList()}
      </div>

      {!courses.error && items.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      <Modal
        show={loginPrompt !== null}
        onHide={() => setLoginPrompt(null)}
        centered
        dialogClassName="ht-modal-dialog"
        contentClassName="ht-modal"
        backdropClassName="ht-backdrop"
        aria-labelledby="ht-login-title"
      >
        <h2 id="ht-login-title" className="ht-h2">
          Cần đăng nhập
        </h2>
        <p className="ht-body-muted">{loginPrompt?.message}</p>
        <div className="ht-modal__actions">
          <button type="button" className="ht-btn ht-btn--ghost" onClick={() => setLoginPrompt(null)}>
            Để sau
          </button>
          <Link
            to="/login"
            state={{ from: { pathname: loginPrompt?.path ?? '/' } }}
            className="ht-btn ht-btn--primary"
          >
            Đăng nhập
          </Link>
        </div>
      </Modal>
    </div>
  );
}

export default CourseListPage;
