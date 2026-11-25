// AI-assisted [AI-07] [AI-28]
// HT-15: Danh mục và duyệt khóa học (quản trị viên)
// Giao diện theo Figma trang "03 – Quản trị": "HT-15 · Danh mục & duyệt khóa học" (Desktop / Mobile, Sáng / Tối)
// và "Trạng thái bảng · HT-14/15". Vẫn giữ 2 trang riêng trên menu: /admin/categories và /admin/courses.
import { useState } from 'react';
import { Modal, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getAdminCourses,
  hideCourse,
  unhideCourse,
  updateCategory,
} from '../../services/adminCatalogService';
import { parseApiError } from '../../utils/apiError';
import { getCategoryTheme } from '../../utils/categoryTheme';
import './CategoryCoursePage.css';

// Trạng thái luôn có ký hiệu + chữ (Figma Badge)
const STATUS = {
  public: { label: '✓ Công khai', cls: 'public' },
  draft: { label: '✎ Nháp', cls: 'draft' },
  hidden: { label: '◌ Đã ẩn', cls: 'hidden' },
};

// Bỏ dấu tiếng Việt để gõ "co so" vẫn ra "Cơ sở"
const normalize = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

// Chip danh mục mang màu riêng của danh mục (dùng chung bộ màu với thẻ khóa học ở trang chủ)
const CategoryChip = ({ name, id }) => (
  <span className={`cc-chip ${getCategoryTheme(name, id).className}`}>{name ?? '—'}</span>
);

// Trạng thái đang tải / trống / lỗi (Figma "Trạng thái bảng · HT-14/15")
function PanelState({ tone, title, message, action }) {
  if (tone === 'loading') {
    return (
      <div className="cc-skeleton" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => <span key={i} />)}
      </div>
    );
  }
  return (
    <div className="cc-state" role={tone === 'error' ? 'alert' : 'status'}>
      <span className={`cc-state-icon ${tone}`} aria-hidden="true">{tone === 'error' ? '!' : '≡'}</span>
      <h3 className="cc-state-title">{title}</h3>
      <p className="cc-muted">{message}</p>
      {action}
    </div>
  );
}

function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = Boolean(category?.id);
  const [name, setName] = useState(category?.name ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tên danh mục không được để trống.');
      return;
    }
    setSaving(true);
    try {
      const res = isEdit ? await updateCategory(category.id, trimmed) : await createCategory(trimmed);
      onSaved(res.data?.name ?? trimmed, isEdit);
    } catch (err) {
      setError(parseApiError(err).message);
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered dialogClassName="cc-modal-dialog" contentClassName="cc-modal" aria-labelledby="cc-cat-title">
      <form onSubmit={handleSubmit} noValidate className="cc-modal-body">
        <h2 id="cc-cat-title" className="cc-modal-title">{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
        <div className={`cc-field${error ? ' has-error' : ''}`}>
          <label htmlFor="cat-name">Tên danh mục</label>
          <input id="cat-name" type="text" autoFocus maxLength={255} placeholder="Ví dụ: Cấu trúc dữ liệu"
            value={name} onChange={(e) => setName(e.target.value)}
            aria-invalid={error ? true : undefined} aria-describedby="cat-name-note" />
          <div id="cat-name-note" className={error ? 'cc-err' : 'cc-hint'}>
            {error ? `✕ ${error}` : 'Hiển thị ở bộ lọc trang chủ và trên thẻ khóa học'}
          </div>
        </div>
        <div className="cc-modal-actions">
          <button type="button" className="ht-btn ht-btn--ghost" onClick={onClose} disabled={saving}>Hủy</button>
          <button type="submit" className="ht-btn ht-btn--primary" disabled={saving}>
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Xác nhận xóa danh mục (thay cho window.confirm)
function ConfirmDeleteModal({ category, busy, onCancel, onConfirm }) {
  return (
    <Modal show onHide={busy ? undefined : onCancel} centered backdrop={busy ? 'static' : true}
      dialogClassName="cc-modal-dialog" contentClassName="cc-modal" aria-labelledby="cc-del-title">
      <div className="cc-modal-body">
        <h2 id="cc-del-title" className="cc-modal-title">Xóa danh mục?</h2>
        <p className="cc-muted">
          Danh mục <CategoryChip name={category.name} id={category.id} /> chưa có khóa học nào. Sau khi xóa sẽ không khôi phục được.
        </p>
        <div className="cc-modal-actions">
          <button type="button" className="ht-btn ht-btn--secondary" onClick={onCancel} disabled={busy}>Hủy</button>
          <button type="button" className="ht-btn cc-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Đang xóa...' : 'Xóa danh mục'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CategoryPanel({ notify, renderHead }) {
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(null); // null = đóng, {} = thêm mới, {id,name} = sửa
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error } = useFetch(getAdminCategories, { version });
  const categories = Array.isArray(data) ? data : [];
  const reload = () => setVersion((v) => v + 1);

  const handleSaved = (name, isEdit) => {
    setEditing(null);
    notify(isEdit ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục', isEdit ? `Danh mục đổi tên thành "${name}".` : `Đã thêm "${name}".`);
    reload();
  };

  const askDelete = (category) => {
    if (category.courseCount > 0) {
      notify('Không thể xóa',
        `Danh mục "${category.name}" đang có ${category.courseCount} khóa học. Hãy chuyển các khóa sang danh mục khác trước.`, 'warn');
      return;
    }
    setDeleting(category);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteCategory(deleting.id);
      notify('Đã xóa danh mục', `Đã xóa "${deleting.name}".`);
    } catch (err) {
      notify('Không thể xóa', parseApiError(err).message, 'error');
    }
    setBusy(false);
    setDeleting(null);
    reload();
  };

  const totalCourses = categories.reduce((sum, c) => sum + (Number(c.courseCount) || 0), 0);

  let body;
  if (error) {
    body = (
      <PanelState tone="error" title="Không tải được dữ liệu" message={`${error} Kiểm tra mạng rồi bấm “Thử lại”.`}
        action={<button type="button" className="ht-btn ht-btn--secondary" onClick={reload}>Thử lại</button>} />
    );
  } else if (loading && !data) {
    body = <PanelState tone="loading" />;
  } else if (categories.length === 0) {
    body = (
      <PanelState tone="empty" title="Chưa có danh mục nào" message="Thêm danh mục đầu tiên để giảng viên chọn khi tạo khóa học."
        action={<button type="button" className="ht-btn ht-btn--primary" onClick={() => setEditing({})}>+ Thêm danh mục</button>} />
    );
  } else {
    body = (
      <>
        <ul className={`cc-cat-grid${loading ? ' is-loading' : ''}`}>
          {categories.map((c) => (
            <li key={c.id} className="cc-cat-card">
              <CategoryChip name={c.name} id={c.id} />
              <span className="cc-cat-count">{c.courseCount} khóa học</span>
              <div className="cc-actions">
                <button type="button" className="cc-link-btn" onClick={() => setEditing(c)} aria-label={`Sửa ${c.name}`}>Sửa</button>
                <button type="button" className="cc-link-btn danger" onClick={() => askDelete(c)} aria-label={`Xóa ${c.name}`}>Xóa</button>
              </div>
            </li>
          ))}
        </ul>
        <p className="cc-summary">{categories.length} danh mục · {totalCourses} khóa học</p>
      </>
    );
  }

  return (
    <>
      {renderHead(
        <button type="button" className="ht-btn ht-btn--primary" onClick={() => setEditing({})}>+ Thêm danh mục</button>,
      )}
      {body}
      {editing && (
        <CategoryModal key={editing.id ?? 'new'} category={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
      {deleting && (
        <ConfirmDeleteModal category={deleting} busy={busy} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </>
  );
}

function CoursePanel({ notify, renderHead }) {
  const [version, setVersion] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { data, loading, error } = useFetch(getAdminCourses, { version });
  const courses = Array.isArray(data) ? data : [];
  const reload = () => setVersion((v) => v + 1);

  const q = normalize(keyword.trim());
  const visible = courses.filter((c) => !q || normalize(c.title).includes(q)
    || normalize(c.categoryName ?? '').includes(q) || normalize(c.teacherName ?? '').includes(q));
  const countOf = (status) => courses.filter((c) => c.status === status).length;

  const toggleHidden = async (course) => {
    const hide = course.status !== 'hidden';
    setBusyId(course.id);
    try {
      const res = hide ? await hideCourse(course.id) : await unhideCourse(course.id);
      if (hide) {
        notify('Đã ẩn khóa học', `"${course.title}" đã bị ẩn khỏi danh sách công khai.`, 'warn');
      } else {
        const restored = res.data?.status === 'draft' ? 'nháp' : 'công khai';
        notify('Đã hiện lại khóa học', `"${course.title}" đã hiển thị trở lại (${restored}).`, 'info');
      }
    } catch (err) {
      notify('Thao tác thất bại', parseApiError(err).message, 'error');
    } finally {
      setBusyId(null);
      reload();
    }
  };

  let body;
  if (error) {
    body = (
      <PanelState tone="error" title="Không tải được dữ liệu" message={`${error} Kiểm tra mạng rồi bấm “Thử lại”.`}
        action={<button type="button" className="ht-btn ht-btn--secondary" onClick={reload}>Thử lại</button>} />
    );
  } else if (loading && !data) {
    body = <PanelState tone="loading" />;
  } else if (visible.length === 0) {
    body = courses.length === 0 ? (
      <PanelState tone="empty" title="Chưa có khóa học nào" message="Khóa học do giảng viên tạo sẽ hiện ở đây để duyệt." />
    ) : (
      <PanelState tone="empty" title="Không có khóa học phù hợp"
        message={`Không tìm thấy khóa học nào khớp “${keyword.trim()}”. Thử tên khóa học, giảng viên hoặc danh mục khác.`}
        action={<button type="button" className="ht-btn ht-btn--primary" onClick={() => setKeyword('')}>Xóa tìm kiếm</button>} />
    );
  } else {
    body = (
      <table className={`cc-table${loading ? ' is-loading' : ''}`}>
        <thead>
          <tr>
            <th scope="col">Khóa học cần duyệt</th>
            <th scope="col">Giảng viên</th>
            <th scope="col">Danh mục</th>
            <th scope="col">Trạng thái</th>
            <th scope="col" className="c-actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((c) => {
            const status = STATUS[c.status] ?? STATUS.draft;
            const hidden = c.status === 'hidden';
            return (
              <tr key={c.id}>
                <td className="c-title">{c.title}</td>
                <td className="c-teacher">{c.teacherName ?? '—'}</td>
                <td className="c-category"><CategoryChip name={c.categoryName} id={c.categoryId} /></td>
                <td className="c-status"><span className={`cc-badge ${status.cls}`}>{status.label}</span></td>
                <td className="c-actions">
                  <div className="cc-actions">
                    <Link to={`/courses/${c.id}`} className="cc-link-btn" aria-label={`Xem ${c.title}`}>Xem</Link>
                    <button type="button" className={`cc-link-btn${hidden ? '' : ' danger'}`} disabled={busyId === c.id}
                      onClick={() => toggleHidden(c)} aria-label={`${hidden ? 'Hiện lại' : 'Ẩn'} ${c.title}`}>
                      {hidden ? 'Hiện lại' : 'Ẩn'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <>
      {renderHead(null)}
      <label className="cc-search">
        <span className="cc-search-icon" aria-hidden="true" />
        <input type="search" placeholder="Tìm theo tên khóa học, giảng viên hoặc danh mục..." aria-label="Tìm khóa học"
          value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </label>
      <div className="cc-table-card">{body}</div>
      {!error && courses.length > 0 && (
        <p className="cc-summary" aria-live="polite">
          {q ? `Hiển thị ${visible.length} trong ${courses.length} khóa học · ` : `${courses.length} khóa học · `}
          {countOf('public')} công khai · {countOf('draft')} nháp · {countOf('hidden')} đang bị ẩn
        </p>
      )}
    </>
  );
}

// Hai trang riêng trên menu: /admin/categories và /admin/courses
const SECTIONS = {
  categories: {
    title: 'Danh mục khóa học',
    desc: 'Thêm, sửa, xóa danh mục. Chỉ xóa được danh mục chưa có khóa học.',
    Panel: CategoryPanel,
  },
  courses: {
    title: 'Duyệt khóa học',
    desc: 'Xem tất cả khóa học và ẩn các khóa học vi phạm.',
    Panel: CoursePanel,
  },
};

function CategoryCoursePage({ section = 'categories' }) {
  const { title, desc, Panel } = SECTIONS[section] ?? SECTIONS.categories;
  const [toasts, setToasts] = useState([]);

  const notify = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [{ id, title, message, type }, ...list]);
  };
  const closeToast = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  // Tiêu đề trang + nút bên phải (nếu có) theo Figma "Tiêu đề trang"
  const renderHead = (action) => (
    <div className="cc-page-head">
      <div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );

  return (
    <div className="category-course-page">
      <Panel notify={notify} renderHead={renderHead} />

      <ToastContainer position="top-end" className="p-3 cc-toasts" containerPosition="fixed">
        {toasts.map((t) => (
          <Toast key={t.id} onClose={() => closeToast(t.id)} delay={3500} autohide className={`cc-toast ${t.type}`}>
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

export default CategoryCoursePage;
