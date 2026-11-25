// AI-assisted [AI-17]
import { Link, useLocation } from 'react-router-dom';

// Nút chính trong thẻ ghi danh (Figma "Thẻ ghi danh" / "Thẻ học tiếp"), rộng hết thẻ
function EnrollButton({ user, courseId, isEnrolled, enrolling, onEnroll }) {
  const location = useLocation();

  if (!user) {
    return (
      <Link to="/login" state={{ from: location }} className="ht-btn ht-btn--primary w-100">
        Đăng nhập để ghi danh
      </Link>
    );
  }
  if (user.role !== 'student') return null;

  return isEnrolled ? (
    <Link
      to={`/courses/${courseId}/learn`}
      state={{ fromCourseDetail: true }}
      className="ht-btn ht-btn--primary w-100"
    >
      Vào học
    </Link>
  ) : (
    <button type="button" className="ht-btn ht-btn--primary w-100" disabled={enrolling} onClick={onEnroll}>
      {enrolling ? 'Đang ghi danh…' : 'Ghi danh'}
    </button>
  );
}

export default EnrollButton;
