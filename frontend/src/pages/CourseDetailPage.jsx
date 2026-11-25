// AI-assisted [AI-09] [AI-17]
import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/useAuth';
import { getCourseById, enrollCourse } from '../services/courseService';
import { parseApiError } from '../utils/apiError';
import { getCategoryTheme, getInitials } from '../utils/categoryTheme';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import LessonList from '../components/course/LessonList';
import EnrollButton from '../components/course/EnrollButton';
import NotFoundPage from './NotFoundPage';
import '../components/course/course.css'; // nhãn danh mục .ht-badge dùng chung
import './CourseDetailPage.css';

const MAX_QUIZ_ATTEMPTS = 3; // HT-06: tối đa 3 lần làm bài

// Câu đầu của mô tả để làm tóm tắt trên banner (mô tả chỉ 1 câu thì không lặp lại)
const firstSentence = (text = '') => {
  const match = String(text).match(/^.+?[.!?](\s|$)/);
  return match && match[0].trim() !== String(text).trim() ? match[0].trim() : '';
};

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
  const isStudent = user?.role === 'student';
  // Chỉ giảng viên sở hữu khóa học mới thấy (route quản lý bài học dành cho giảng viên)
  const isOwner = user?.role === 'teacher' && Number(user.id) === Number(course.teacherId);
  const lessonCount = course.lessons.length;
  const studentCount = Number(course.studentCount ?? 0) + (justEnrolled ? 1 : 0);
  const theme = getCategoryTheme(course.categoryName, course.categoryId);
  const summary = firstSentence(course.description);

  // Nội dung thẻ ghi danh theo vai trò / trạng thái
  const enrollCard = (() => {
    if (isOwner) {
      return {
        title: 'Khóa học của bạn',
        text: 'Học viên sẽ thấy nút Ghi danh tại đây.',
      };
    }
    if (user && !isStudent) {
      return { title: 'Thông tin ghi danh', text: 'Chỉ tài khoản học viên mới ghi danh khóa học.' };
    }
    if (isEnrolled) {
      return { title: 'Tiếp tục học', text: 'Tiến độ được lưu tự động sau mỗi bài bạn đánh dấu hoàn thành.' };
    }
    return {
      title: 'Bắt đầu học ngay',
      text: `Ghi danh miễn phí để mở khóa ${lessonCount} bài học và bài kiểm tra cuối khóa. Tiến độ được lưu tự động.`,
    };
  })();

  const quizHint = (() => {
    if (!user) return 'Đăng nhập và ghi danh để làm bài kiểm tra.';
    if (!isStudent) return 'Chỉ học viên mới làm bài kiểm tra.';
    if (!isEnrolled) return 'Ghi danh để làm bài kiểm tra.';
    return `Bạn có tối đa ${MAX_QUIZ_ATTEMPTS} lượt làm bài.`;
  })();

  return (
    <div className="ht-detail">
      <section className={`ht-detail__banner ${theme.className}`}>
        <div className="ht-detail__info">
          <button type="button" className="ht-detail__back" onClick={() => navigate('/', { replace: true })}>
            ‹ Quay lại danh sách
          </button>
          {state?.notice && (
            <div className="ht-detail__notice" role="alert">
              <span aria-hidden="true">⚠</span> {state.notice}
            </div>
          )}
          {course.categoryName && <span className="ht-badge ht-caption">{course.categoryName}</span>}
          <h1 className="ht-detail__title">{course.title}</h1>
          {summary && <p className="ht-body">{summary}</p>}
          <ul className="ht-detail__meta">
            <li>Giảng viên: {course.teacherName}</li>
            <li>{lessonCount} bài học</li>
            <li>{studentCount.toLocaleString('vi-VN')} học viên đã ghi danh</li>
          </ul>
        </div>

        <aside className="ht-detail__enroll" aria-label="Ghi danh">
          <h2 className="ht-h2">{enrollCard.title}</h2>
          {isStudent && isEnrolled && <span className="ht-status-badge ht-caption">✓ Đã ghi danh</span>}
          {isOwner ? (
            <Link to={`/teacher/courses/${course.id}/lessons`} className="ht-btn ht-btn--secondary w-100">
              Quản lý bài học
            </Link>
          ) : (
            <EnrollButton
              user={user}
              courseId={course.id}
              isEnrolled={isEnrolled}
              enrolling={enrolling}
              onEnroll={handleEnroll}
            />
          )}
          {enrollError && (
            <p className="ht-detail__error ht-caption" role="alert">
              <span aria-hidden="true">✕</span> {enrollError}
            </p>
          )}
          <p className="ht-body-muted">{enrollCard.text}</p>
        </aside>
      </section>

      <div className="ht-detail__main">
        <div className="ht-detail__content">
          <h2 className="ht-h2">Giới thiệu khóa học</h2>
          <p className="ht-body ht-detail__description">{course.description}</p>

          <h2 className="ht-h2 ht-detail__section-title">
            Nội dung khóa học · {lessonCount} bài{isEnrolled ? ' · đã mở khóa' : ''}
          </h2>
          <LessonList lessons={course.lessons} chapters={course.chapters} unlocked={isEnrolled} />
          {!isEnrolled && lessonCount > 0 && (
            <p className="ht-caption ht-detail__note">Nội dung bài học chỉ hiển thị sau khi bạn ghi danh.</p>
          )}
        </div>

        <div className="ht-detail__side">
          <section className="ht-side-card">
            <h2 className="ht-h3">Giảng viên</h2>
            <div className="ht-side-card__teacher">
              <span className="ht-side-card__avatar" aria-hidden="true">
                {getInitials(course.teacherName)}
              </span>
              <span className="ht-side-card__name">{course.teacherName}</span>
            </div>
          </section>

          <section className="ht-side-card">
            <h2 className="ht-h3">Bài kiểm tra cuối khóa</h2>
            <p className="ht-body-muted">
              Trắc nghiệm 4 lựa chọn · chấm điểm tự động · tối đa {MAX_QUIZ_ATTEMPTS} lần làm
            </p>
            {isStudent && isEnrolled ? (
              <Link to={`/courses/${course.id}/quiz`} className="ht-btn ht-btn--secondary w-100">
                Làm bài kiểm tra
              </Link>
            ) : (
              <button type="button" className="ht-btn ht-btn--secondary ht-btn--locked w-100" disabled>
                Làm bài kiểm tra
              </button>
            )}
            <p className="ht-caption ht-side-card__hint">{quizHint}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
