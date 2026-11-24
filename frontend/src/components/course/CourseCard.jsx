// AI-assisted [AI-03] [AI-08]
import { Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserAvatar from '../common/UserAvatar';

const DEFAULT_COVER = '/images/course-default.jpg';

/**
 * Thẻ khóa học dùng chung (danh sách, "Khóa học của tôi", trang giảng viên...).
 * - to: đường dẫn khi bấm vào thẻ (mặc định trang chi tiết khóa học)
 * - children: nội dung thêm ở cuối thẻ, ví dụ thanh tiến độ hoặc nút thao tác
 */
function CourseCard({
  course,
  to = `/courses/${course.id}`,
  actionLabel = 'Xem khóa học',
  onClick, // tùy chọn: chặn điều hướng, ví dụ khách chưa đăng nhập
  children,
}) {
  return (
    <Card className="course-card h-100 shadow-sm">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={course.coverImage || DEFAULT_COVER}
          alt={course.title}
          style={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
        />
        <span className="course-card-cta btn btn-secondary btn-sm position-absolute bottom-0 start-0 m-2">
          {actionLabel}
        </span>
      </div>

      <Card.Body className="d-flex flex-column">
        {course.categoryName && (
          <div className="mb-2">
            <Badge bg="light" text="dark" className="border fw-normal">
              {course.categoryName}
            </Badge>
          </div>
        )}

        <Card.Title as="h3" className="h6">
          <Link to={to} onClick={onClick} className="stretched-link text-decoration-none text-dark">
            {course.title}
          </Link>
        </Card.Title>

        <div className="d-flex align-items-center text-muted small mb-2">
          <UserAvatar
            name={course.teacherName}
            avatar={course.teacherAvatar}
            role="teacher"
            size={24}
            className="me-2"
          />
          {course.teacherName}
        </div>

        {course.lessonCount != null && (
          <div className="small text-muted mt-auto">{course.lessonCount} bài học</div>
        )}

        {children && (
          <div className="position-relative mt-2" style={{ zIndex: 1 }}>
            {children}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default CourseCard;
