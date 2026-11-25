// AI-assisted [AI-08]
// HT-14: Quản lý người dùng (quản trị viên)
import { useEffect, useState } from 'react';
import { Dropdown, Modal, Toast, ToastContainer } from 'react-bootstrap';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useFetch } from '../../hooks/useFetch';
import {
  createTeacher,
  deleteUser,
  getUsers,
  setUserLocked,
  updateUserName,
} from '../../services/adminUserService';
import { parseApiError } from '../../utils/apiError';
import { getPageItems } from '../../utils/pagination';
import { toAvatarUrl } from '../../utils/avatar';
import './UserManagementPage.css';

const ROLE_LABEL = { all: 'Tất cả người dùng', student: 'Học viên', teacher: 'Giảng viên' };
const SEARCH_HINT = {
  all: 'Tìm tất cả người dùng theo tên hoặc email...',
  student: 'Tìm học viên theo tên hoặc email...',
  teacher: 'Tìm giảng viên theo tên hoặc email...',
};
const PAGE_SIZES = [5, 10, 20, 50];
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const fmt = (n) => Number(n ?? 0).toLocaleString('vi-VN');
const initial = (name = '') => name.trim().split(/\s+/).at(-1)?.charAt(0).toUpperCase() || '?';

// Ngày giờ -> { date: "14/11/2026", time: "21:03" }
const fmtDateTime = (value) => {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return { date: '—', time: '' };
  const pad = (n) => String(n).padStart(2, '0');
  return { date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
};

const ICON = {
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  view: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  unlock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.8-1.2" /></>,
  trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
};
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICON[name]}
  </svg>
);

function IconButton({ icon, label, danger, onClick, disabled }) {
  return (
    <button type="button" className={`um-icon-btn ${danger ? 'danger' : ''}`} title={label} aria-label={label}
      onClick={onClick} disabled={disabled}>
      <Icon name={icon} />
    </button>
  );
}

const Avatar = ({ user }) => {
  const [broken, setBroken] = useState(false);
  const src = broken ? '' : toAvatarUrl(user.avatar);
  return src ? (
    <img className={`um-avatar um-avatar-img ${user.role}`} src={src} alt="" onError={() => setBroken(true)} />
  ) : (
    <div className={`um-avatar ${user.role}`} aria-hidden="true">{initial(user.name)}</div>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`um-badge ${role === 'teacher' ? 'teacher' : 'student'}`}>{role === 'teacher' ? 'Giảng viên' : 'Học viên'}</span>
);

const STATUS_LABEL = { locked: 'Bị chặn', pending: 'Chờ xử lý', active: 'Hoạt động' };

const StatusBadge = ({ status }) => (
  <span className={`um-badge ${status === 'locked' ? 'locked' : status === 'pending' ? 'pending' : 'active'}`}>
    {STATUS_LABEL[status] ?? 'Hoạt động'}
  </span>
);

const coursesText = (u) => `${fmt(u.courses)} khóa ${u.role === 'teacher' ? 'giảng dạy' : 'ghi danh'}`;

// Thêm giảng viên (user = null) hoặc sửa họ tên người dùng
function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const setField = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = values.name.trim();
    const email = values.email.trim();
    const next = {};
    if (!name) next.name = 'Họ tên không được để trống.';
    else if (name.length < 2) next.name = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!isEdit) {
      if (!email) next.email = 'Email không được để trống.';
      else if (!EMAIL_REGEX.test(email)) next.email = 'Email không hợp lệ.';
      if (values.password.length < 6) next.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      if (isEdit) await updateUserName(user.id, name);
      else await createTeacher({ name, email, password: values.password });
      onSaved(name, isEdit);
    } catch (err) {
      const message = parseApiError(err).message;
      setErrors(/email/i.test(message) ? { email: message } : /mật khẩu/i.test(message) ? { password: message } : { name: message });
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered className="um-modal">
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="um-modal-title">
            {isEdit ? (user.role === 'teacher' ? 'Sửa thông tin giảng viên' : 'Sửa thông tin học viên') : 'Thêm giảng viên'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="um-field">
            <label htmlFor="um-name">Họ và tên</label>
            <input id="um-name" type="text" autoFocus maxLength={255} placeholder="Ví dụ: Nguyễn Văn A"
              value={values.name} onChange={setField('name')} />
            {errors.name && <div className="um-err">{errors.name}</div>}
          </div>
          <div className="um-field">
            <label htmlFor="um-email">Email</label>
            <input id="um-email" type="email" maxLength={255} placeholder="giangvien@email.com"
              value={values.email} onChange={setField('email')} disabled={isEdit} />
            {errors.email && <div className="um-err">{errors.email}</div>}
            {isEdit && <div className="um-hint">Email là định danh đăng nhập nên không sửa được.</div>}
          </div>
          {!isEdit && (
            <div className="um-field">
              <label htmlFor="um-pw">Mật khẩu tạm</label>
              <input id="um-pw" type="text" autoComplete="off" placeholder="Giảng viên đổi lại sau khi đăng nhập"
                value={values.password} onChange={setField('password')} />
              {errors.password && <div className="um-err">{errors.password}</div>}
              <div className="um-hint">Tài khoản được tạo với vai trò Giảng viên và trạng thái Hoạt động.</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="um-btn" onClick={onClose}>Hủy</button>
          <button type="submit" className="um-btn um-btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

function UserProfileModal({ user, onClose }) {
  const { date, time } = fmtDateTime(user.createdAt);
  return (
    <Modal show onHide={onClose} centered className="um-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="um-modal-title">Hồ sơ người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="um-profile">
          <Avatar user={user} />
          <div>
            <div className="um-user-name">{user.name}</div>
            <div className="um-user-email">{user.email}</div>
          </div>
        </div>
        <dl className="um-profile-list">
          <dt>Vai trò</dt><dd><RoleBadge role={user.role} /></dd>
          <dt>Trạng thái</dt><dd><StatusBadge status={user.status} /></dd>
          <dt>{user.role === 'teacher' ? 'Giảng dạy' : 'Ghi danh'}</dt><dd>{coursesText(user)}</dd>
          <dt>Ngày đăng ký</dt><dd>{date} <span className="um-muted">{time}</span></dd>
        </dl>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="um-btn" onClick={onClose}>Đóng</button>
      </Modal.Footer>
    </Modal>
  );
}

function UserManagementPage() {
  const [role, setRole] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState(''); // từ khóa đã "chốt" sau khi ngừng gõ
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState(null); // { type: 'form' | 'view', user }
  const [busyId, setBusyId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Đợi người dùng ngừng gõ 300ms rồi mới gọi API tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(keyword.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, loading, error } = useFetch(getUsers, { role, search, page, limit: pageSize, version });
  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const counts = data?.counts ?? { all: 0, student: 0, teacher: 0 };
  const totalPages = data?.pagination?.totalPages ?? 1;
  const reload = () => setVersion((v) => v + 1);

  const notify = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [{ id, title, message, type }, ...list]);
  };
  const closeToast = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  const changeRole = (next) => {
    setRole(next);
    setPage(1);
  };

  const toggleLock = async (u) => {
    const lock = u.status !== 'locked';
    setBusyId(u.id);
    try {
      await setUserLocked(u.id, lock);
      if (lock) notify('Đã chặn tài khoản', `${u.name} sẽ không đăng nhập được nữa.`, 'warn');
      else notify('Đã bỏ chặn tài khoản', `${u.name} đã có thể đăng nhập lại.`, 'info');
    } catch (err) {
      notify('Thao tác thất bại', parseApiError(err).message, 'warn');
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const handleDelete = async (u) => {
    const isTeacher = u.role === 'teacher';
    if (isTeacher && u.courses > 0) {
      notify('Không thể xóa', `${u.name} đang có ${u.courses} khóa học giảng dạy. Hãy chặn tài khoản thay vì xóa.`, 'warn');
      return;
    }
    const question = isTeacher
      ? `Xóa tài khoản giảng viên ${u.name}?`
      : `Xóa tài khoản học viên ${u.name}?
Toàn bộ ghi danh, kết quả làm bài và tiến độ học của học viên này cũng sẽ bị xóa.`;
    if (!window.confirm(question)) return;
    setBusyId(u.id);
    try {
      await deleteUser(u.id);
      notify(isTeacher ? 'Đã xóa giảng viên' : 'Đã xóa học viên', `${u.name} đã bị xóa khỏi hệ thống.`, 'warn');
    } catch (err) {
      notify('Không thể xóa', parseApiError(err).message, 'warn');
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const handleSaved = (name, isEdit) => {
    setModal(null);
    if (isEdit) {
      notify('Đã cập nhật', `Đã lưu thông tin của ${name}.`);
    } else {
      notify('Đã thêm giảng viên', `${name} đã có thể đăng nhập và tạo khóa học.`);
      // Người mới tạo xếp đầu danh sách
      setRole((r) => (r === 'student' ? 'all' : r));
      setPage(1);
    }
    reload();
  };

  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = (page - 1) * pageSize + users.length;
  const openAdd = () => setModal({ type: 'form', user: null });

  return (
    <div className="user-management-page">
      <div className="um-page-head">
        <h1>Quản lý người dùng</h1>
        <button type="button" className="um-btn um-btn-primary um-add-btn" onClick={openAdd}>＋ Thêm giảng viên</button>
      </div>

      <div className="um-toolbar">
        <Dropdown className="um-role-filter" onSelect={(key) => changeRole(key)}>
          <Dropdown.Toggle className="um-role-toggle" variant="light">
            {ROLE_LABEL[role]} ({fmt(counts[role])})
          </Dropdown.Toggle>
          <Dropdown.Menu className="um-role-menu">
            {Object.keys(ROLE_LABEL).map((key) => (
              <Dropdown.Item key={key} eventKey={key} active={key === role}>
                <span>{ROLE_LABEL[key]}</span>
                <span className="um-count">{fmt(counts[key])}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <label className="um-search">
          <Icon name="search" />
          <input type="search" placeholder={SEARCH_HINT[role]} aria-label="Tìm người dùng theo tên hoặc email"
            value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </label>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className={`um-table-card ${loading ? 'is-loading' : ''}`}>
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Ghi danh / Giảng dạy</th>
              <th>Trạng thái</th>
              <th>Ngày đăng ký</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && users.length === 0 ? (
              <tr className="um-empty-row">
                <td colSpan={6}>
                  {search
                    ? `Không tìm thấy ${ROLE_LABEL[role].toLowerCase()} nào khớp với "${search}".`
                    : `Chưa có ${ROLE_LABEL[role].toLowerCase()} nào.`}
                </td>
              </tr>
            ) : users.map((u) => {
              const { date, time } = fmtDateTime(u.createdAt);
              const busy = busyId === u.id;
              return (
                <tr key={u.id}>
                  <td className="c-user">
                    <div className="um-user-cell">
                      <Avatar user={u} />
                      <div>
                        <div className="um-user-name">{u.name}</div>
                        <div className="um-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="c-role"><RoleBadge role={u.role} /></td>
                  <td className="c-courses" data-label={u.role === 'teacher' ? 'Giảng dạy' : 'Ghi danh'}>{coursesText(u)}</td>
                  <td className="c-status"><StatusBadge status={u.status} /></td>
                  <td className="c-date" data-label="Ngày đăng ký">
                    <span className="um-date">{date} <span className="um-muted">{time}</span></span>
                  </td>
                  <td className="c-actions">
                    <div className="um-actions">
                      <IconButton icon="edit" label="Sửa" onClick={() => setModal({ type: 'form', user: u })} />
                      <IconButton icon="view" label="Xem hồ sơ" onClick={() => setModal({ type: 'view', user: u })} />
                      {u.status === 'locked'
                        ? <IconButton icon="unlock" label="Bỏ chặn" disabled={busy} onClick={() => toggleLock(u)} />
                        : <IconButton icon="lock" label="Chặn" danger disabled={busy} onClick={() => toggleLock(u)} />}
                      <IconButton icon="trash" label="Xóa" danger disabled={busy} onClick={() => handleDelete(u)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="um-pagination-bar">
        <div className="um-page-size">
          <label htmlFor="um-page-size">Hiển thị</label>
          <select id="um-page-size" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>dòng mỗi trang · {fmt(from)}–{fmt(to)} trên tổng {fmt(total)} người dùng</span>
        </div>
        <div className="um-pagination">
          <button type="button" className="um-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
          {getPageItems(page, totalPages).map((item) => (typeof item === 'number' ? (
            <button type="button" key={item} className={`um-page-btn num ${item === page ? 'active' : ''}`}
              aria-current={item === page ? 'page' : undefined} onClick={() => setPage(item)}>
              {item}
            </button>
          ) : <span key={item} className="um-page-gap num">…</span>))}
          <span className="um-page-mobile">Trang {page} / {totalPages}</span>
          <button type="button" className="um-page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau ›</button>
        </div>
      </div>

      <button type="button" className="um-fab" title="Thêm giảng viên" aria-label="Thêm giảng viên" onClick={openAdd}>＋</button>

      {modal?.type === 'form' && (
        <UserFormModal key={modal.user?.id ?? 'new'} user={modal.user} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'view' && <UserProfileModal user={modal.user} onClose={() => setModal(null)} />}

      <ToastContainer position="top-end" className="p-3 um-toasts" containerPosition="fixed">
        {toasts.map((t) => (
          <Toast key={t.id} onClose={() => closeToast(t.id)} delay={4000} autohide className={`um-toast ${t.type}`}>
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

export default UserManagementPage;
