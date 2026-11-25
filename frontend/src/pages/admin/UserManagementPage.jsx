// AI-assisted [AI-08] [AI-27]
// HT-14: Quản lý người dùng (quản trị viên)
// Giao diện theo Figma trang "03 – Quản trị": "HT-14 · Quản lý người dùng", "HT-14 · Tạo tài khoản giảng viên (modal)",
// "Trạng thái bảng · HT-14/15 (đang tải / trống / lỗi)", bản Mobile (mỗi người dùng là một thẻ).
import { useEffect, useState } from 'react';
import { Modal, Toast, ToastContainer } from 'react-bootstrap';
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
import { getInitials } from '../../utils/categoryTheme';
import './UserManagementPage.css';

const ROLE_LABEL = { all: 'Tất cả vai trò', student: 'Học viên', teacher: 'Giảng viên' };
const ROLE_NOUN = { all: 'người dùng', student: 'học viên', teacher: 'giảng viên' };
const PAGE_SIZES = [5, 10, 20, 50];
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const fmt = (n) => Number(n ?? 0).toLocaleString('vi-VN');

// Ngày giờ -> { date: "14/11/2026", time: "21:03" }
const fmtDateTime = (value) => {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return { date: '—', time: '' };
  const pad = (n) => String(n).padStart(2, '0');
  return { date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
};

const Avatar = ({ user }) => {
  const [broken, setBroken] = useState(false);
  const src = broken ? '' : toAvatarUrl(user.avatar);
  return src ? (
    <img className={`um-avatar um-avatar-img ${user.role}`} src={src} alt="" onError={() => setBroken(true)} />
  ) : (
    <span className={`um-avatar ${user.role}`} aria-hidden="true">{getInitials(user.name) || '?'}</span>
  );
};

const roleText = (role) => (role === 'teacher' ? 'Giảng viên' : 'Học viên');

// Trạng thái luôn có ký hiệu + chữ (Figma Badge): ✓ Hoạt động, ◌ Đã khóa, ⏳ Chờ đổi mật khẩu
const STATUS = {
  active: { mark: '✓', label: 'Hoạt động' },
  locked: { mark: '◌', label: 'Đã khóa' },
  pending: { mark: '⏳', label: 'Chờ đổi mật khẩu' },
};
const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.active;
  return <span className={`um-badge ${STATUS[status] ? status : 'active'}`}>{s.mark} {s.label}</span>;
};

// Giới hạn ô nhập ở form tạo / sửa tài khoản
const LIMIT = { name: 50, email: 50, password: 20 };

const coursesText = (u) => `${fmt(u.courses)} khóa ${u.role === 'teacher' ? 'giảng dạy' : 'ghi danh'}`;

// Ô nhập theo component "Input" của Figma: nhãn, ô, gợi ý hoặc lỗi "✕ …"
function Field({ id, label, hint, error, children }) {
  return (
    <div className={`um-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <div id={`${id}-note`} className={error ? 'um-err' : 'um-hint'}>
        {error ? `✕ ${error}` : hint}
      </div>
    </div>
  );
}

// Tạo tài khoản giảng viên (user = null) hoặc sửa họ tên người dùng
function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setField = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = values.name.trim();
    const email = values.email.trim();
    const next = {};
    if (!name) next.name = 'Họ tên không được để trống.';
    else if (name.length < 2) next.name = 'Họ tên phải có ít nhất 2 ký tự.';
    else if (name.length > LIMIT.name) next.name = `Họ tên tối đa ${LIMIT.name} ký tự.`;
    if (!isEdit) {
      if (!email) next.email = 'Email không được để trống.';
      else if (email.length > LIMIT.email) next.email = `Email tối đa ${LIMIT.email} ký tự.`;
      else if (!EMAIL_REGEX.test(email)) next.email = 'Email không hợp lệ.';
      if (values.password.length < 6) next.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
      else if (values.password.length > LIMIT.password) next.password = `Mật khẩu tối đa ${LIMIT.password} ký tự.`;
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

  const title = isEdit ? (user.role === 'teacher' ? 'Sửa thông tin giảng viên' : 'Sửa thông tin học viên') : 'Tạo tài khoản giảng viên';
  const aria = (field) => ({ 'aria-invalid': errors[field] ? true : undefined, 'aria-describedby': `um-${field}-note` });

  return (
    <Modal show onHide={onClose} centered dialogClassName="um-modal-dialog" contentClassName="um-modal" aria-labelledby="um-form-title">
      <form onSubmit={handleSubmit} noValidate className="um-modal-body">
        <h2 id="um-form-title" className="um-modal-title">{title}</h2>
        <Field id="um-name" label={isEdit ? 'Họ và tên' : 'Họ và tên giảng viên'} error={errors.name}
          hint={`${isEdit ? 'Tên hiển thị trên hồ sơ và khóa học' : 'Hiển thị trên các khóa học do giảng viên phụ trách'} · ${values.name.length}/${LIMIT.name} ký tự`}>
          <input id="um-name" type="text" autoFocus maxLength={LIMIT.name} placeholder="Ví dụ: Nguyễn Văn A"
            value={values.name} onChange={setField('name')} {...aria('name')} />
        </Field>
        <Field id="um-email" label="Email" error={errors.email}
          hint={isEdit ? 'Email là định danh đăng nhập nên không sửa được' : `Dùng để đăng nhập, không sửa được sau khi tạo · tối đa ${LIMIT.email} ký tự`}>
          <input id="um-email" type="email" maxLength={isEdit ? undefined : LIMIT.email} placeholder="giangvien@email.com"
            value={values.email} onChange={setField('email')} disabled={isEdit} {...aria('email')} />
        </Field>
        {!isEdit && (
          <Field id="um-password" label="Mật khẩu tạm thời" error={errors.password}
            hint={`Từ 6 đến ${LIMIT.password} ký tự · giảng viên phải đổi ở lần đăng nhập đầu`}>
            <div className="um-password">
              <input id="um-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" maxLength={LIMIT.password}
                placeholder={`6–${LIMIT.password} ký tự`} value={values.password} onChange={setField('password')} {...aria('password')} />
              <button type="button" className="um-link-btn" onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword} aria-controls="um-password">
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </Field>
        )}
        <div className="um-modal-actions">
          <button type="button" className="ht-btn ht-btn--ghost" onClick={onClose} disabled={saving}>Hủy</button>
          <button type="submit" className="ht-btn ht-btn--primary" disabled={saving}>
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UserProfileModal({ user, onClose }) {
  const { date, time } = fmtDateTime(user.createdAt);
  return (
    <Modal show onHide={onClose} centered dialogClassName="um-modal-dialog" contentClassName="um-modal" aria-labelledby="um-profile-title">
      <div className="um-modal-body">
        <h2 id="um-profile-title" className="um-modal-title">Hồ sơ người dùng</h2>
        <div className="um-profile">
          <Avatar user={user} />
          <div>
            <div className="um-user-name">{user.name}</div>
            <div className="um-user-email">{user.email}</div>
          </div>
        </div>
        <dl className="um-profile-list">
          <div><dt>Vai trò</dt><dd>{roleText(user.role)}</dd></div>
          <div><dt>Trạng thái</dt><dd><StatusBadge status={user.status} /></dd></div>
          <div><dt>{user.role === 'teacher' ? 'Giảng dạy' : 'Ghi danh'}</dt><dd>{coursesText(user)}</dd></div>
          <div><dt>Ngày đăng ký</dt><dd>{date} <span className="um-muted">{time}</span></dd></div>
        </dl>
        <div className="um-modal-actions">
          <button type="button" className="ht-btn ht-btn--secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </Modal>
  );
}

// Xác nhận xóa (thay cho window.confirm)
function ConfirmDeleteModal({ user, busy, onCancel, onConfirm }) {
  const isTeacher = user.role === 'teacher';
  return (
    <Modal show onHide={busy ? undefined : onCancel} centered backdrop={busy ? 'static' : true}
      dialogClassName="um-modal-dialog" contentClassName="um-modal" aria-labelledby="um-delete-title">
      <div className="um-modal-body">
        <h2 id="um-delete-title" className="um-modal-title">Xóa tài khoản {isTeacher ? 'giảng viên' : 'học viên'}?</h2>
        <p className="um-note is-error">
          <span className="um-note-icon" aria-hidden="true">!</span>
          <span>
            <strong>{user.name}</strong> ({user.email}) sẽ bị xóa khỏi hệ thống và không khôi phục được.
            {!isTeacher && ' Toàn bộ ghi danh, kết quả làm bài và tiến độ học của học viên này cũng bị xóa.'}
          </span>
        </p>
        <p className="um-muted">Nếu chỉ muốn tạm ngừng, hãy dùng “Khóa” thay vì xóa.</p>
        <div className="um-modal-actions">
          <button type="button" className="ht-btn ht-btn--secondary" onClick={onCancel} disabled={busy}>Hủy</button>
          <button type="button" className="ht-btn um-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Đang xóa...' : 'Xóa tài khoản'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Trạng thái bảng theo Figma "Trạng thái bảng · HT-14/15"
function TableState({ tone, title, message, action }) {
  return (
    <div className="um-state" role={tone === 'error' ? 'alert' : 'status'}>
      <span className={`um-state-icon ${tone}`} aria-hidden="true">{tone === 'error' ? '!' : '≡'}</span>
      <h2 className="um-state-title">{title}</h2>
      <p className="um-muted">{message}</p>
      {action}
    </div>
  );
}

function UserManagementPage() {
  const [role, setRole] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState(''); // từ khóa đã "chốt" sau khi ngừng gõ
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState(null); // { type: 'form' | 'view' | 'delete', user }
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

  const clearFilters = () => {
    setKeyword('');
    setSearch('');
    changeRole('all');
  };

  const toggleLock = async (u) => {
    const lock = u.status !== 'locked';
    setBusyId(u.id);
    try {
      await setUserLocked(u.id, lock);
      if (lock) notify('Đã khóa tài khoản', `${u.name} sẽ không đăng nhập được nữa.`, 'warn');
      else notify('Đã mở khóa tài khoản', `${u.name} đã có thể đăng nhập lại.`, 'info');
    } catch (err) {
      notify('Thao tác thất bại', parseApiError(err).message, 'error');
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const askDelete = (u) => {
    if (u.role === 'teacher' && u.courses > 0) {
      notify('Không thể xóa', `${u.name} đang có ${u.courses} khóa học giảng dạy. Hãy khóa tài khoản thay vì xóa.`, 'warn');
      return;
    }
    setModal({ type: 'delete', user: u });
  };

  const handleDelete = async (u) => {
    const isTeacher = u.role === 'teacher';
    setBusyId(u.id);
    try {
      await deleteUser(u.id);
      notify(isTeacher ? 'Đã xóa giảng viên' : 'Đã xóa học viên', `${u.name} đã bị xóa khỏi hệ thống.`, 'warn');
    } catch (err) {
      notify('Không thể xóa', parseApiError(err).message, 'error');
    } finally {
      setBusyId(null);
      setModal(null);
      reload();
    }
  };

  const handleSaved = (name, isEdit) => {
    setModal(null);
    if (isEdit) {
      notify('Đã cập nhật', `Đã lưu thông tin của ${name}.`);
    } else {
      notify('Đã tạo tài khoản giảng viên', `${name} đã có thể đăng nhập và tạo khóa học.`);
      // Người mới tạo xếp đầu danh sách
      setRole((r) => (r === 'student' ? 'all' : r));
      setPage(1);
    }
    reload();
  };

  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = (page - 1) * pageSize + users.length;
  const openAdd = () => setModal({ type: 'form', user: null });

  const renderBody = () => {
    if (error) {
      return (
        <TableState tone="error" title="Không tải được dữ liệu" message={`${error} Kiểm tra mạng rồi bấm “Thử lại”.`}
          action={<button type="button" className="ht-btn ht-btn--secondary" onClick={reload}>Thử lại</button>} />
      );
    }
    if (loading && !data) {
      return (
        <div className="um-skeleton" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => <span key={i} />)}
        </div>
      );
    }
    if (users.length === 0) {
      return (
        <TableState tone="empty" title={`Không có ${ROLE_NOUN[role]} phù hợp`}
          message={search ? `Không tìm thấy tài khoản nào khớp “${search}”. Kiểm tra lại tên, email hoặc đổi bộ lọc vai trò.` : `Chưa có ${ROLE_NOUN[role]} nào.`}
          action={(search || role !== 'all') && <button type="button" className="ht-btn ht-btn--primary" onClick={clearFilters}>Xóa bộ lọc</button>} />
      );
    }
    return (
      <table className="um-table">
        <thead>
          <tr>
            <th scope="col" className="c-user">Họ tên</th>
            <th scope="col" className="c-email">Email</th>
            <th scope="col" className="c-role">Vai trò</th>
            <th scope="col" className="c-status">Trạng thái</th>
            <th scope="col" className="c-actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const busy = busyId === u.id;
            const locked = u.status === 'locked';
            return (
              <tr key={u.id}>
                <td className="c-user">
                  {/* Bấm tên để xem hồ sơ (số khóa học, ngày đăng ký) */}
                  <button type="button" className="um-user-cell" onClick={() => setModal({ type: 'view', user: u })}
                    title={`Xem hồ sơ: ${u.name}`}>
                    <Avatar user={u} />
                    <span className="um-user-name um-clamp">{u.name}</span>
                  </button>
                </td>
                <td className="c-email"><span className="um-clamp" title={u.email}>{u.email}</span></td>
                <td className="c-role">{roleText(u.role)}</td>
                <td className="c-status"><StatusBadge status={u.status} /></td>
                <td className="c-actions">
                  <div className="um-actions">
                    <button type="button" className="um-link-btn" onClick={() => setModal({ type: 'form', user: u })}
                      aria-label={`Sửa ${u.name}`}>Sửa</button>
                    <button type="button" className="um-link-btn" disabled={busy} onClick={() => toggleLock(u)}
                      aria-label={`${locked ? 'Mở khóa' : 'Khóa'} ${u.name}`}>{locked ? 'Mở khóa' : 'Khóa'}</button>
                    <button type="button" className="um-link-btn danger" disabled={busy} onClick={() => askDelete(u)}
                      aria-label={`Xóa ${u.name}`}>Xóa</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="user-management-page">
      <div className="um-page-head">
        <h1>Người dùng</h1>
        <button type="button" className="ht-btn ht-btn--primary" onClick={openAdd}>+ Tạo tài khoản giảng viên</button>
      </div>

      <div className="um-toolbar">
        <label className="um-search">
          <span className="um-search-icon" aria-hidden="true" />
          <input type="search" placeholder="Tìm theo tên hoặc email..." aria-label="Tìm người dùng theo tên hoặc email"
            value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </label>
        <div className="um-role-filter">
          <label htmlFor="um-role">Vai trò</label>
          <select id="um-role" value={role} onChange={(e) => changeRole(e.target.value)}>
            {Object.keys(ROLE_LABEL).map((key) => (
              <option key={key} value={key}>{ROLE_LABEL[key]} ({fmt(counts[key])})</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`um-table-card${loading && data ? ' is-loading' : ''}`}>{renderBody()}</div>

      {!error && total > 0 && (
        <div className="um-pagination-bar">
          <div className="um-page-size">
            <span aria-live="polite">Hiển thị {fmt(from)}–{fmt(to)} trong {fmt(total)} {ROLE_NOUN[role]}</span>
            <label htmlFor="um-page-size">· Mỗi trang</label>
            <select id="um-page-size" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {totalPages > 1 && (
            <nav className="um-pagination" aria-label="Phân trang người dùng">
              <button type="button" className="um-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
              {getPageItems(page, totalPages).map((item) => (typeof item === 'number' ? (
                <button type="button" key={item} className={`um-page-btn num${item === page ? ' active' : ''}`}
                  aria-current={item === page ? 'page' : undefined} onClick={() => setPage(item)}>
                  {item}
                </button>
              ) : <span key={item} className="um-page-gap num">…</span>))}
              <span className="um-page-mobile">Trang {page} / {totalPages}</span>
              <button type="button" className="um-page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau ›</button>
            </nav>
          )}
        </div>
      )}

      {modal?.type === 'form' && (
        <UserFormModal key={modal.user?.id ?? 'new'} user={modal.user} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.type === 'view' && <UserProfileModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && (
        <ConfirmDeleteModal user={modal.user} busy={busyId === modal.user.id}
          onCancel={() => setModal(null)} onConfirm={() => handleDelete(modal.user)} />
      )}

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
