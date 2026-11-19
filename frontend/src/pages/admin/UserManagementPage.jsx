// AI-assisted [AI-15]
// Màn 06 – Quản lý người dùng (HT-14): lọc vai trò, tìm kiếm, phân trang, thêm / sửa / xem hồ sơ / chặn.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getUsers, setUserLocked } from '../../services/userService';
import { parseApiError } from '../../utils/apiError';
import { getPageItems } from '../../utils/pagination';
import { coursesText, fmtDateTime, fmtNumber, ROLE_LABEL } from '../../utils/userDisplay';
import UserAvatar from '../../components/admin/UserAvatar';
import UserFormModal from '../../components/admin/UserFormModal';
import UserProfileModal from '../../components/admin/UserProfileModal';
import './UserManagementPage.css';

const PAGE_SIZES = [5, 10, 20, 50];
const SEARCH_HINT = {
  all: 'Tìm tất cả người dùng theo tên hoặc email...',
  student: 'Tìm học viên theo tên hoặc email...',
  teacher: 'Tìm giảng viên theo tên hoặc email...',
};

// Icon SVG (nét vẽ theo bộ Lucide)
const ICON_PATHS = {
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  view: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  unlock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.8-1.2" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  info: <path d="M12 16v-4M12 8h.01" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
};

function Icon({ name, strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

function IconButton({ icon, label, className = '', ...rest }) {
  return (
    <button type="button" className={`um-icon-btn ${className}`} title={label} aria-label={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
}

// Thông báo góc phải trên, tự ẩn sau 4 giây
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const show = useCallback((title, msg, type = 'success') => {
    const id = nextId.current++;
    setToasts((list) => [{ id, title, msg, type }, ...list].slice(0, 3));
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return { toasts, show, dismiss };
}

const TOAST_ICON = { success: 'check', warn: 'lock', info: 'info' };

// Điện thoại: gợi ý ô tìm kiếm ngắn lại cho vừa màn hình
const mobileQuery = window.matchMedia('(max-width: 640px)');
const subscribeMobile = (cb) => {
  mobileQuery.addEventListener('change', cb);
  return () => mobileQuery.removeEventListener('change', cb);
};
const useIsMobile = () => useSyncExternalStore(subscribeMobile, () => mobileQuery.matches);

function UserManagementPage() {
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [formUser, setFormUser] = useState(undefined); // undefined = đóng, null = thêm mới, object = sửa
  const [profileId, setProfileId] = useState(null);
  const roleMenuRef = useRef(null);
  const { toasts, show: showToast, dismiss } = useToasts();
  const isMobile = useIsMobile();

  // Chờ người dùng ngừng gõ 300ms rồi mới gọi API tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(keyword.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, loading, error } = useFetch(getUsers, { role, search, page, limit: pageSize, reloadKey });
  const users = data?.items ?? [];
  const counts = data?.counts ?? { all: 0, student: 0, teacher: 0 };
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };
  const totalPages = pagination.totalPages || 1;
  const reload = () => setReloadKey((k) => k + 1);

  // Nếu dữ liệu thay đổi khiến trang hiện tại vượt quá số trang thì lùi về trang cuối
  if (!loading && data && page > totalPages) setPage(totalPages);

  const chooseRole = (nextRole) => {
    setRole(nextRole);
    setPage(1);
    if (roleMenuRef.current) roleMenuRef.current.open = false;
  };

  const toggleLock = async (u) => {
    const locking = u.status !== 'locked';
    setBusyId(u.id);
    try {
      await setUserLocked(u.id, locking);
      if (locking) showToast('Đã chặn tài khoản', `${u.name} sẽ không đăng nhập được nữa.`, 'warn');
      else showToast('Đã bỏ chặn tài khoản', `${u.name} đã có thể đăng nhập lại.`, 'info');
      reload();
    } catch (err) {
      showToast('Không thực hiện được', parseApiError(err).message, 'warn');
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = (saved, isEdit) => {
    setFormUser(undefined);
    showToast(
      isEdit ? 'Đã cập nhật người dùng' : 'Đã thêm người dùng',
      isEdit ? `Thông tin của ${saved.name} đã được lưu.` : `${saved.name} đã được thêm vào hệ thống.`,
    );
    if (!isEdit) setPage(1);
    reload();
  };

  const from = pagination.total ? (pagination.page - 1) * pageSize + 1 : 0;
  const to = from ? from + users.length - 1 : 0;

  return (
    <div className="um-page">
      <div className="um-head">
        <h1>Quản lý người dùng</h1>
        <button type="button" className="um-btn um-btn-primary" onClick={() => setFormUser(null)}>
          ＋ Thêm người dùng
        </button>
      </div>

      <div className="um-toolbar">
        <details className="um-role-filter" ref={roleMenuRef}>
          <summary>{ROLE_LABEL[role]} ({fmtNumber(counts[role])})</summary>
          <nav className="um-role-menu">
            {['all', 'student', 'teacher'].map((r) => (
              <button key={r} type="button" className={r === role ? 'active' : ''} onClick={() => chooseRole(r)}>
                {ROLE_LABEL[r]} <span className="um-count">{fmtNumber(counts[r])}</span>
              </button>
            ))}
          </nav>
        </details>

        <label className="um-search">
          <Icon name="search" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={isMobile ? 'Tìm theo tên hoặc email...' : SEARCH_HINT[role]}
            aria-label="Tìm theo tên hoặc email"
          />
        </label>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className={`um-table-card ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
        <table className="um-table">
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
            {!loading && users.length === 0 && !error && (
              <tr className="um-empty">
                <td colSpan={6}>
                  {search
                    ? `Không tìm thấy ${role === 'all' ? 'người dùng' : ROLE_LABEL[role].toLowerCase()} nào khớp với "${search}".`
                    : 'Chưa có người dùng nào.'}
                </td>
              </tr>
            )}
            {users.map((u) => {
              const { date, time } = fmtDateTime(u.createdAt);
              const locked = u.status === 'locked';
              return (
                <tr key={u.id}>
                  <td className="um-c-user">
                    <div className="um-user-cell">
                      <UserAvatar user={u} />
                      <div>
                        <div className="um-user-name">{u.name}</div>
                        <div className="um-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="um-c-role" data-label="Vai trò">
                    <span className={`um-badge um-badge-${u.role}`}>{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td className="um-c-courses" data-label={u.role === 'teacher' ? 'Giảng dạy' : 'Ghi danh'}>
                    {coursesText(u)}
                  </td>
                  <td className="um-c-status" data-label="Trạng thái">
                    {locked
                      ? <span className="um-badge um-badge-locked">Bị chặn</span>
                      : <span className="um-badge um-badge-active">Hoạt động</span>}
                  </td>
                  <td className="um-c-date" data-label="Ngày đăng ký">
                    <div className="um-date">{date} <span className="um-time">{time}</span></div>
                  </td>
                  <td className="um-c-actions">
                    <div className="um-actions">
                      <IconButton icon="edit" label="Sửa" onClick={() => setFormUser(u)} />
                      <IconButton icon="view" label="Xem hồ sơ" onClick={() => setProfileId(u.id)} />
                      <IconButton
                        icon={locked ? 'unlock' : 'lock'}
                        label={locked ? 'Bỏ chặn' : 'Chặn'}
                        className={locked ? '' : 'danger'}
                        disabled={busyId === u.id}
                        onClick={() => toggleLock(u)}
                      />
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
          <select
            id="um-page-size"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>
            dòng mỗi trang · {fmtNumber(from)}–{fmtNumber(to)} trên tổng {fmtNumber(pagination.total)} người dùng
          </span>
        </div>
        <div className="um-pages">
          <button type="button" className="um-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹ Trước
          </button>
          {getPageItems(page, totalPages).map((item) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                className={`um-page-btn num ${item === page ? 'active' : ''}`}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="um-page-gap">…</span>
            ),
          )}
          <span className="um-page-mobile">Trang {page} / {totalPages}</span>
          <button type="button" className="um-page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Sau ›
          </button>
        </div>
      </div>

      <button type="button" className="um-fab" title="Thêm người dùng" aria-label="Thêm người dùng"
        onClick={() => setFormUser(null)}>＋</button>

      {formUser !== undefined && (
        <UserFormModal
          key={formUser?.id ?? 'new'}
          user={formUser}
          onClose={() => setFormUser(undefined)}
          onSaved={handleSaved}
        />
      )}
      {profileId && <UserProfileModal userId={profileId} onClose={() => setProfileId(null)} />}

      <div className="um-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`um-toast ${t.type === 'success' ? '' : t.type}`}>
            <span className="um-toast-icon"><Icon name={TOAST_ICON[t.type]} strokeWidth={3} /></span>
            <div className="um-toast-body">
              <div className="um-toast-title">{t.title}</div>
              <div className="um-toast-msg">{t.msg}</div>
            </div>
            <button type="button" className="um-toast-close" aria-label="Đóng" onClick={() => dismiss(t.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManagementPage;
