// AI-assisted [AI-06] [AI-19]
// HT-07: Hồ sơ và kết quả học tập của học viên
import { cloneElement, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import { getCategoryTheme, getInitials } from '../utils/categoryTheme';
import { useAuth } from '../context/useAuth';
import { useFetch } from '../hooks/useFetch';
import {
  changePassword,
  getEnrolledCourses,
  getProfile,
  getQuizHistory,
  toAvatarUrl,
  updateAvatar,
  updateProfileName,
} from '../services/profileService';
import { parseApiError } from '../utils/apiError';
import { getTeacherCourses } from '../services/lessonService';
import './ProfilePage.css';

const MAX_ATTEMPTS = 3;
const MIN_PASSWORD_LENGTH = 6;
const ROLE_LABEL = { student: 'Học viên', teacher: 'Giảng viên', admin: 'Quản trị viên' };

const initial = (name = '') => getInitials(name) || '?';
const scoreClass = (score) => (score >= 8 ? 'high' : score >= 5 ? 'mid' : 'low');
const formatScore = (score) => Number(score).toFixed(1);

// "2026-11-20T14:05:00.000Z" -> "20/11/2026 21:05" (giờ máy người dùng)
const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // khớp giới hạn 2 MB ở backend

// Ảnh đại diện: chọn ảnh -> xem trước -> Lưu / Hủy
function AvatarPicker({ name, avatar, onSaved, notify }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [broken, setBroken] = useState(false);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
  };

  const handleChoose = (event) => {
    const chosen = event.target.files?.[0];
    event.target.value = ''; // cho phép chọn lại cùng một tệp
    if (!chosen) return;
    if (!AVATAR_TYPES.includes(chosen.type)) {
      setError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
      return;
    }
    if (chosen.size > MAX_AVATAR_SIZE) {
      setError('Ảnh vượt quá dung lượng tối đa 2 MB.');
      return;
    }
    setError('');
    if (preview) URL.revokeObjectURL(preview);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await updateAvatar(file);
      reset();
      setBroken(false);
      onSaved(res.data?.avatar ?? null);
      notify('Đã lưu', 'Ảnh đại diện đã được cập nhật.');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const src = preview || (!broken && toAvatarUrl(avatar));

  return (
    <div className="pf-avatar-wrap">
      {/* Ảnh đại diện tròn 96px + huy hiệu máy ảnh (Figma "Ảnh đại diện (chữ viết tắt)") */}
      <div className="pf-avatar-box">
        {src ? (
          <img className="pf-avatar pf-avatar-img" src={src} alt={`Ảnh đại diện của ${name}`} onError={() => setBroken(true)} />
        ) : (
          <div className="pf-avatar" aria-hidden="true">{initial(name)}</div>
        )}
        <span className="pf-avatar-cam" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M2.5 6.2a1.6 1.6 0 0 1 1.6-1.6h1.7L7 3h4l1.2 1.6h1.7a1.6 1.6 0 0 1 1.6 1.6v6.6a1.6 1.6 0 0 1-1.6 1.6H4.1a1.6 1.6 0 0 1-1.6-1.6Z" />
            <circle cx="9" cy="9.4" r="2.6" />
          </svg>
        </span>
      </div>

      {file ? (
        <div className="pf-avatar-actions">
          <button type="button" className="ht-btn ht-btn--primary pf-btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu ảnh'}
          </button>
          <button type="button" className="ht-btn ht-btn--ghost pf-btn-sm" onClick={reset} disabled={saving}>Hủy</button>
        </div>
      ) : (
        <label className="ht-btn ht-btn--secondary pf-avatar-choose">
          Đổi ảnh
          {/* Ẩn bằng CSS (không dùng hidden) để vẫn bấm Tab tới được */}
          <input className="pf-visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChoose} />
        </label>
      )}
      <div className="pf-avatar-hint">JPG, PNG hoặc WEBP, tối đa 2 MB</div>
      {error && <div className="pf-err" role="alert">✕ {error}</div>}
    </div>
  );
}

// Ô nhập theo component "Input" của Figma: nhãn, ô, gợi ý hoặc lỗi "✕ …" bên dưới
function Field({ id, label, hint, error, children }) {
  const noteId = `${id}-note`;
  return (
    <div className={`pf-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': noteId })}
      <div id={noteId} className={error ? 'pf-err' : 'pf-hint'}>
        {error ? `✕ ${error}` : hint}
      </div>
    </div>
  );
}

function ProfileInfoForm({ profile, onSaved, notify }) {
  const [name, setName] = useState(profile.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(trimmed ? 'Họ tên phải có ít nhất 2 ký tự.' : 'Họ tên không được để trống.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await updateProfileName(trimmed);
      setName(res.data?.name ?? trimmed);
      onSaved(res.data ?? { ...profile, name: trimmed });
      notify('Đã lưu', 'Thông tin cá nhân đã được cập nhật.');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pf-box" onSubmit={handleSubmit} noValidate>
      <h3>Thông tin cá nhân</h3>
      <Field id="pf-name" label="Họ và tên" hint="Tên hiển thị trên hồ sơ và lịch sử học" error={error}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
      </Field>
      <Field id="pf-email" label="Email" hint="Không thể đổi email sau khi đăng ký">
        <input type="email" value={profile.email} disabled />
      </Field>
      <div className="pf-form-foot">
        <button type="submit" className="ht-btn ht-btn--primary" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}

const EMPTY_PASSWORDS = { current: '', next: '', confirm: '' };

function ChangePasswordForm({ notify, onPasswordChanged }) {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.current) nextErrors.current = 'Vui lòng nhập mật khẩu hiện tại.';
    if (values.next.length < MIN_PASSWORD_LENGTH) {
      nextErrors.next = `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    } else if (values.next !== values.confirm) {
      nextErrors.confirm = 'Mật khẩu xác nhận không khớp.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await changePassword({ currentPassword: values.current, newPassword: values.next });
      setValues(EMPTY_PASSWORDS);
      onPasswordChanged?.();
      notify('Đổi mật khẩu thành công', 'Lần đăng nhập sau hãy dùng mật khẩu mới.');
    } catch (err) {
      const message = parseApiError(err).message;
      // Lỗi sai mật khẩu hiện tại hiện ngay dưới ô đó, lỗi khác hiện dưới ô mật khẩu mới
      setErrors(/hiện tại/i.test(message) ? { current: message } : { next: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="pf-box" onSubmit={handleSubmit} noValidate>
      <h3>Đổi mật khẩu</h3>
      <Field id="pw-current" label="Mật khẩu hiện tại" hint="Nhập mật khẩu bạn đang dùng" error={errors.current}>
        <input type="password" autoComplete="current-password" placeholder="••••••••"
          value={values.current} onChange={setField('current')} />
      </Field>
      <Field id="pw-new" label="Mật khẩu mới" hint={`Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`} error={errors.next}>
        <input type="password" autoComplete="new-password" placeholder="••••••••"
          value={values.next} onChange={setField('next')} />
      </Field>
      <Field id="pw-confirm" label="Nhập lại mật khẩu mới" hint="Nhập giống mật khẩu mới ở trên" error={errors.confirm}>
        <input type="password" autoComplete="new-password" placeholder="••••••••"
          value={values.confirm} onChange={setField('confirm')} />
      </Field>
      <div className="pf-form-foot">
        <button type="submit" className="ht-btn ht-btn--secondary" disabled={saving}>
          {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
}

function QuizHistory({ history, loading, error }) {
  if (loading && !history) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!history?.length) {
    return <div className="pf-box pf-empty">Bạn chưa làm bài trắc nghiệm nào.</div>;
  }

  return history.map((course) => (
    <div className="pf-course-group" key={course.courseId}>
      <div className="pf-course-head">
        <span>{course.courseTitle}</span>
        <span className="pf-best">
          Điểm cao nhất: <b>{formatScore(course.bestScore)}</b> · {course.attempts.length}/{MAX_ATTEMPTS} lượt
        </span>
      </div>
      <div className="pf-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lượt</th>
              <th style={{ width: 90 }}>Điểm</th>
              <th style={{ width: 120 }}>Thời gian làm</th>
              <th style={{ width: 170 }}>Thời điểm nộp</th>
            </tr>
          </thead>
          <tbody>
            {course.attempts.map((attempt) => (
              <tr key={attempt.attemptId}>
                <td>
                  <Link
                    to={`/profile/quiz-attempts/${attempt.attemptId}`}
                    className="pf-attempt-tag pf-attempt-link"
                    title="Xem lại bài làm"
                  >
                    Lần {attempt.attemptNumber}
                  </Link>
                  {attempt.status === 'expired' && (
                    <span className="pf-expired-tag" title="Lượt này bị bỏ dở và hệ thống tự đóng khi hết giờ">Bỏ dở</span>
                  )}
                  {attempt.status !== 'expired' && attempt.score === course.bestScore && (
                    <span className="pf-best-mark">● Cao nhất</span>
                  )}
                </td>
                <td className={`pf-score ${scoreClass(attempt.score)}`}>{formatScore(attempt.score)}</td>
                <td className="pf-num">{attempt.durationMinutes ? `${attempt.durationMinutes} phút` : '—'}</td>
                <td className="pf-num">{formatDateTime(attempt.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ));
}

// Nhãn trạng thái khóa học: luôn có ký hiệu + chữ, không chỉ dùng màu (Figma component "Badge")
const COURSE_STATUS = {
  public: { label: '✓ Công khai', className: 'is-public', note: 'học viên tìm thấy' },
  draft: { label: '✎ Nháp', className: 'is-draft', note: 'chưa xuất bản' },
  hidden: { label: '◌ Đã ẩn', className: 'is-hidden', note: 'học viên không thấy khóa này' },
};
const COURSES_PER_PAGE = 4;

function TeacherCourses({ courses, loading, error }) {
  const [page, setPage] = useState(1);

  if (loading && !courses) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!courses?.length) {
    return (
      <div className="pf-box pf-empty">
        <span className="pf-empty-art" aria-hidden="true">📚</span>
        <h3>Bạn chưa phụ trách khóa học nào</h3>
        <p>Tạo khóa học đầu tiên ở trang Quản lý bài học, sau đó thêm bài và công khai cho học viên.</p>
        <Link to="/teacher/lessons" className="ht-btn ht-btn--primary">+ Tạo khóa học</Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = courses.slice((current - 1) * COURSES_PER_PAGE, current * COURSES_PER_PAGE);

  return (
    <div className="pf-box pf-courses">
      <h3>Khóa học phụ trách ({courses.length})</h3>
      <ul className="pf-course-list">
        {visible.map((course) => {
          const status = COURSE_STATUS[course.status] ?? COURSE_STATUS.draft;
          const categoryName = course.categoryName || course.category_name || course.category?.name || 'Chưa phân loại';
          const cat = getCategoryTheme(categoryName, course.categoryId);
          return (
            <li className="pf-course-item" key={course.id}>
              <span className={`pf-course-dot ${cat.className}`} aria-hidden="true" />
              <div className="pf-course-body">
                <span className="pf-course-title">{course.title}</span>
                <span className="pf-course-meta">Danh mục: {categoryName} · {status.note}</span>
                <div className="pf-course-row">
                  <span className={`pf-badge ${status.className}`}>{status.label}</span>
                  <span className="pf-course-actions">
                    <Link to={`/teacher/courses/${course.id}/lessons`}>Quản lý bài học</Link>
                    <Link to={`/courses/${course.id}`}>Xem khóa học</Link>
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {totalPages > 1 && <Pagination page={current} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

function ProfilePage() {
  const { user, role, updateUser } = useAuth();
  // Tab đang mở lấy từ URL:
  //   /profile               -> Thông tin & Mật khẩu (mặc định)
  //   /profile?tab=account   -> Thông tin & Mật khẩu
  //   /profile?tab=history   -> Lịch sử làm bài (học viên)
  //   /profile?tab=courses   -> Khóa học phụ trách (giảng viên)
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const tab = ['account', 'history', 'courses'].includes(requestedTab) ? requestedTab : 'account';
  const setTab = (next) => setSearchParams({ tab: next });
  const [toasts, setToasts] = useState([]);
  const [savedProfile, setSavedProfile] = useState(null);
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';

  const profileReq = useFetch(getProfile);
  const historyReq = useFetch(isStudent ? getQuizHistory : null);
  const coursesReq = useFetch(isStudent ? getEnrolledCourses : null);
  const teacherCoursesReq = useFetch(isTeacher ? getTeacherCourses : null);

  const profile = savedProfile ?? profileReq.data;
  const history = Array.isArray(historyReq.data) ? historyReq.data : null;
  const attemptCount = history ? history.reduce((sum, c) => sum + c.attempts.length, 0) : 0;
  const courseCount = Array.isArray(coursesReq.data) ? coursesReq.data.length : 0;
  const teacherCourseCount = Array.isArray(teacherCoursesReq.data) ? teacherCoursesReq.data.length : 0;

  const notify = (title, message) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [{ id, title, message }, ...list]);
  };
  const closeToast = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  const handlePasswordChanged = () => {
    setSavedProfile((current) => ({
      ...(current ?? profileReq.data),
      mustChangePassword: false,
    }));
  };

  const handleSaved = (next) => {
    setSavedProfile(next);
    updateUser({ name: next.name }); // cập nhật tên trên thanh điều hướng
  };

  const handleAvatarSaved = (avatar) => {
    setSavedProfile((current) => ({ ...(current ?? profileReq.data), avatar }));
    updateUser({ avatar });
  };

  if (profileReq.loading && !profile) return <Loading />;
  if (profileReq.error && !profile) return <ErrorMessage message={profileReq.error} />;

  const displayName = profile?.name ?? user?.name ?? '';

  return (
    <div className="profile-page">
      <h1 className="pf-title">
        {isStudent ? 'Hồ sơ & Kết quả học tập' : isTeacher ? 'Hồ sơ giảng viên' : 'Hồ sơ cá nhân'}
      </h1>

      {isTeacher && profile?.mustChangePassword && (
        <div className="pf-password-warning" role="alert">
          <span className="pf-password-warning-icon" aria-hidden="true">⚠</span>
          <div>
            <b>Tài khoản đang chờ xử lý</b>
            <span>Bạn cần đổi mật khẩu tạm trước khi tạo khóa học, bài học hoặc câu hỏi.</span>
          </div>
        </div>
      )}

      <div className="pf-layout">
        <aside className="pf-card">
          <AvatarPicker name={displayName} avatar={profile?.avatar} onSaved={handleAvatarSaved} notify={notify} />
          <div className="pf-name">{displayName}</div>
          <div className="pf-email">{profile?.email}</div>
          <div className="pf-role">{ROLE_LABEL[profile?.role] ?? 'Học viên'}</div>
          {(isStudent || isTeacher) && (
            <div className="pf-stats">
              {isStudent ? (
                <>
                  <div className="pf-stat"><b>{courseCount}</b><span>Khóa học</span></div>
                  <div className="pf-stat"><b>{attemptCount}</b><span>Lượt làm bài</span></div>
                </>
              ) : (
                <>
                  <div className="pf-stat"><b>{teacherCourseCount}</b><span>Khóa học</span></div>
                  <div className="pf-stat"><b>Giảng viên</b><span>Vai trò</span></div>
                </>
              )}
            </div>
          )}
        </aside>

        <div className="pf-main">
          {(isStudent || isTeacher) && (
            <div className="pf-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'account'}
                className={`pf-tab ${tab === 'account' ? 'active' : ''}`} onClick={() => setTab('account')}>
                Thông tin &amp; Mật khẩu
              </button>
              {isStudent ? (
                <button type="button" role="tab" aria-selected={tab === 'history'}
                  className={`pf-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
                  Lịch sử làm bài
                </button>
              ) : (
                <button type="button" role="tab" aria-selected={tab === 'courses'}
                  className={`pf-tab ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>
                  Khóa học phụ trách
                </button>
              )}
            </div>
          )}

          {tab === 'account' || (tab === 'history' && !isStudent) || (tab === 'courses' && !isTeacher) ? (
            <section className="pf-account">
              {profile && <ProfileInfoForm key={profile.id} profile={profile} onSaved={handleSaved} notify={notify} />}
              <ChangePasswordForm notify={notify} onPasswordChanged={handlePasswordChanged} />
            </section>
          ) : tab === 'courses' && isTeacher ? (
            <section>
              <TeacherCourses
                courses={Array.isArray(teacherCoursesReq.data) ? teacherCoursesReq.data : null}
                loading={teacherCoursesReq.loading}
                error={teacherCoursesReq.error}
              />
            </section>
          ) : (
            <section>
              <QuizHistory history={history} loading={historyReq.loading} error={historyReq.error} />
            </section>
          )}
        </div>
      </div>

      <ToastContainer position="top-end" className="p-3 pf-toasts" containerPosition="fixed">
        {toasts.map((t) => (
          <Toast key={t.id} onClose={() => closeToast(t.id)} delay={3500} autohide className="pf-toast">
            <Toast.Header closeButton>
              <strong className="me-auto">{t.title}</strong>
            </Toast.Header>
            <Toast.Body>{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  );
}

export default ProfilePage;
