// AI-assisted [AI-03] [AI-08] [AI-16]
import { Link } from 'react-router-dom';
import { getCategoryTheme } from '../../utils/categoryTheme';
import { toMediaUrl } from '../../utils/avatar';
import UserAvatar from '../common/UserAvatar';
import './course.css';

const DEFAULT_COVER = '/images/course-default.jpg';

/**
 * Thẻ khóa học dùng chung (danh sách, "Khóa học của tôi"...). Figma: "Course card · Trang chủ".
 * - to: đường dẫn khi bấm vào thẻ (mặc định trang chi tiết khóa học)
 * - onClick: tùy chọn, chặn điều hướng (ví dụ khách chưa đăng nhập)
 * - children: phần thêm ở cuối thẻ, ví dụ thanh tiến độ hoặc nút thao tác
 */
function CourseCard({ course, to = `/courses/${course.id}`, onClick, children }) {
  const theme = getCategoryTheme(course.categoryName, course.categoryId);
  // Khóa học chưa có ảnh bìa riêng thì vẽ ảnh bìa minh họa theo màu danh mục
  const hasCover = course.coverImage && course.coverImage !== DEFAULT_COVER;

  return (
    <article className={`ht-course-card ${theme.className}`}>
      <div className="ht-course-card__cover">
        {hasCover ? (
          <img src={toMediaUrl(course.coverImage)} alt="" loading="lazy" />
        ) : (
          <>
            <span className="ht-course-card__blob" aria-hidden="true" />
            <span className="ht-course-card__blob ht-course-card__blob--small" aria-hidden="true" />
            <span className="ht-course-card__sticker" aria-hidden="true">
              {theme.sticker}
            </span>
          </>
        )}
      </div>

      <div className="ht-course-card__body">
        {course.categoryName && <span className="ht-badge ht-caption" title={course.categoryName}>{course.categoryName}</span>}

        <h3 className="ht-h3 ht-course-card__title">
          <Link to={to} onClick={onClick} className="stretched-link" title={course.title}>
            {course.title}
          </Link>
        </h3>

        {course.teacherName && (
          <div className="ht-course-card__teacher">
            <UserAvatar avatar={course.teacherAvatar} name={course.teacherName}
              className="ht-avatar ht-caption" imgClassName="ht-avatar-img" />
            <span className="ht-caption" title={course.teacherName}>{course.teacherName}</span>
          </div>
        )}

        {course.lessonCount != null && (
          <div className="ht-caption ht-course-card__meta">{course.lessonCount} bài học</div>
        )}

        {children && <div className="ht-course-card__extra">{children}</div>}
      </div>
    </article>
  );
}

export default CourseCard;
