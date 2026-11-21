// AI-assisted [AI-07]
// HT-15: Danh mục và duyệt khóa học (quản trị viên)
import { useState } from 'react';
import { Modal, Toast, ToastContainer } from 'react-bootstrap';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';
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
import './CategoryCoursePage.css';

const STATUS = {
  public: { label: 'Công khai', cls: 'public' },
  draft: { label: 'Nháp', cls: 'draft' },
  hidden: { label: 'Đã ẩn', cls: 'hidden' },
};

// Bỏ dấu tiếng Việt để gõ "co so" vẫn ra "Cơ sở"
const normalize = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

const ICON = {
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeoff: <><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-3 3.9M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10 10 0 0 0 3.7-.7" /><path d="m4 4 16 16" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
};
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICON[name]}
  </svg>
);

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
    <Modal show onHide={onClose} centered className="cc-modal">
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="cc-modal-title">{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="cat-name" className="cc-label">Tên danh mục</label>
          <input id="cat-name" className="cc-input" type="text" autoFocus maxLength={255}
            placeholder="Ví dụ: Cấu trúc dữ liệu" value={name} onChange={(e) => setName(e.target.value)} />
          {error && <div className="cc-err">{error}</div>}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="cc-btn" onClick={onClose}>Hủy</button>
          <button type="submit" className="cc-btn cc-btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

function CategoryPanel({ notify }) {
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(null); // null = đóng, {} = thêm mới, {id,name} = sửa
  const { data, loading, error } = useFetch(getAdminCategories, { version });
  const categories = Array.isArray(data) ? data : [];
  const reload = () => setVersion((v) => v + 1);

  const handleSaved = (name, isEdit) => {
    setEditing(null);
    notify(isEdit ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục', isEdit ? `Danh mục đổi tên thành "${name}".` : `Đã thêm "${name}".`);
    reload();
  };

  const handleDelete = async (category) => {
    if (category.courseCount > 0) {
      notify('Không thể xóa',
        `Danh mục "${category.name}" đang có ${category.courseCount} khóa học. Hãy chuyển các khóa sang danh mục khác trước.`, 'warn');
      return;
    }
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      notify('Đã xóa danh mục', `Đã xóa "${category.name}".`);
    } catch (err) {
      notify('Không thể xóa', parseApiError(err).message, 'warn');
    }
    reload();
  };

  return (
    <section>
      <div className="cc-panel-head">
        <h2>Danh mục ({categories.length})</h2>
        <button type="button" className="cc-btn cc-btn-primary" onClick={() => setEditing({})}>＋ Thêm danh mục</button>
      </div>
      {error && <ErrorMessage message={error} />}
      {loading && !data ? <Loading /> : (
        <div className="cc-card">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Tên danh mục</th>
                <th style={{ width: 160 }}>Số khóa học</th>
                <th style={{ width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={4} className="cc-empty">Chưa có danh mục nào.</td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id}>
                  <td className="cc-num">{i + 1}</td>
                  <td><span className="cc-chip">{c.name}</span></td>
                  <td className="cc-num">{c.courseCount} khóa học</td>
                  <td>
                    <div className="cc-actions">
                      <button type="button" className="cc-icon-btn" title="Sửa" aria-label={`Sửa ${c.name}`} onClick={() => setEditing(c)}>
                        <Icon name="edit" />
                      </button>
                      <button type="button" className="cc-icon-btn danger" title="Xóa" aria-label={`Xóa ${c.name}`} onClick={() => handleDelete(c)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <CategoryModal key={editing.id ?? 'new'} category={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </section>
  );
}

function CoursePanel({ notify }) {
  const [version, setVersion] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { data, loading, error } = useFetch(getAdminCourses, { version });
  const courses = Array.isArray(data) ? data : [];

  const q = normalize(keyword.trim());
  const visible = courses.filter((c) => !q || normalize(c.title).includes(q) || normalize(c.categoryName ?? '').includes(q));

  const toggleHidden = async (course) => {
    const hide = course.status !== 'hidden';
    setBusyId(course.id);
    try {
      const res = hide ? await hideCourse(course.id) : await unhideCourse(course.id);
      if (hide) {
        notify('Đã ẩn khóa học', `"${course.title}" đã bị ẩn khỏi danh sách công khai.`, 'warn');
      } else {
        const restored = res.data?.status === 'draft' ? 'nháp' : 'công khai';
        notify('Đã bỏ ẩn khóa học', `"${course.title}" đã hiển thị trở lại (${restored}).`, 'info');
      }
    } catch (err) {
      notify('Thao tác thất bại', parseApiError(err).message, 'warn');
    } finally {
      setBusyId(null);
      setVersion((v) => v + 1);
    }
  };

  return (
    <section>
      <div className="cc-panel-head">
        <h2>Khóa học ({courses.length})</h2>
        <label className="cc-search">
          <Icon name="search" />
          <input type="search" placeholder="Tìm khóa học..." aria-label="Tìm khóa học"
            value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </label>
      </div>
      {error && <ErrorMessage message={error} />}
      {loading && !data ? <Loading /> : (
        <div className="cc-card">
          <table className="cc-course-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th style={{ width: 170 }}>Danh mục</th>
                <th style={{ width: 170 }}>Giảng viên</th>
                <th style={{ width: 130 }}>Trạng thái</th>
                <th style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cc-empty">
                    {courses.length === 0 ? 'Chưa có khóa học nào.' : `Không tìm thấy khóa học khớp với "${keyword}".`}
                  </td>
                </tr>
              ) : visible.map((c) => {
                const status = STATUS[c.status] ?? STATUS.draft;
                const hidden = c.status === 'hidden';
                return (
                  <tr key={c.id}>
                    <td><strong>{c.title}</strong></td>
                    <td><span className="cc-chip">{c.categoryName ?? '—'}</span></td>
                    <td>{c.teacherName ?? '—'}</td>
                    <td><span className={`cc-badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <div className="cc-actions">
                        <button type="button" disabled={busyId === c.id}
                          className={`cc-icon-btn ${hidden ? '' : 'danger'}`}
                          title={hidden ? 'Bỏ ẩn' : 'Ẩn khóa học vi phạm'}
                          aria-label={hidden ? `Bỏ ẩn ${c.title}` : `Ẩn ${c.title}`}
                          onClick={() => toggleHidden(c)}>
                          <Icon name={hidden ? 'eye' : 'eyeoff'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CategoryCoursePage() {
  const [tab, setTab] = useState('cat');
  const [toasts, setToasts] = useState([]);

  const notify = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [{ id, title, message, type }, ...list]);
  };
  const closeToast = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  return (
    <div className="category-course-page">
      <div className="cc-page-head">
        <h1>Danh mục &amp; Duyệt khóa học</h1>
        <p>Quản lý danh mục khóa học và ẩn các khóa học vi phạm.</p>
      </div>

      <div className="cc-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'cat'}
          className={`cc-tab ${tab === 'cat' ? 'active' : ''}`} onClick={() => setTab('cat')}>
          Danh mục khóa học
        </button>
        <button type="button" role="tab" aria-selected={tab === 'course'}
          className={`cc-tab ${tab === 'course' ? 'active' : ''}`} onClick={() => setTab('course')}>
          Duyệt khóa học
        </button>
      </div>

      {tab === 'cat' ? <CategoryPanel notify={notify} /> : <CoursePanel notify={notify} />}

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
