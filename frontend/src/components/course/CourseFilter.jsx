// AI-assisted [AI-08] [AI-16]
import { useEffect, useId, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import './course.css';

const SEARCH_DELAY = 400; // ms, tránh gọi API sau mỗi phím gõ

/**
 * Thanh tìm kiếm và lọc khóa học (Figma "Bộ lọc" trên trang chủ).
 * Chỉ báo giá trị lọc cho trang cha, không tự lọc dữ liệu (lọc ở server).
 *
 * props:
 *  - value: { search, categoryId, teacherId }
 *  - categories: [{ id, name }]
 *  - teachers: [{ id, name }]
 *  - onChange(partial): nhận phần thay đổi, ví dụ { categoryId: '2' }
 */
function CourseFilter({ value, categories = [], teachers = [], onChange }) {
  const [keyword, setKeyword] = useState(value.search ?? '');
  const timer = useRef(null);
  const id = useId();

  // Trang cha xóa bộ lọc (ví dụ nút trong ô "Không tìm thấy") thì xóa luôn chữ đang gõ
  const [lastSearch, setLastSearch] = useState(value.search ?? '');
  if ((value.search ?? '') !== lastSearch) {
    setLastSearch(value.search ?? '');
    if ((value.search ?? '') === '') setKeyword('');
  }

  // Hủy hẹn giờ khi gỡ component
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleSearch = (e) => {
    const text = e.target.value;
    setKeyword(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange({ search: text.trim() }), SEARCH_DELAY);
  };

  const handleSelect = (e) => onChange({ [e.target.name]: e.target.value });

  const hasFilter = keyword !== '' || Boolean(value.categoryId) || Boolean(value.teacherId);

  const handleClear = () => {
    clearTimeout(timer.current);
    setKeyword('');
    onChange({ search: '', categoryId: '', teacherId: '' });
  };

  return (
    <form role="search" className="ht-filter" onSubmit={(e) => e.preventDefault()}>
      <label className="ht-search">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span className="visually-hidden">Tìm khóa học theo tên</span>
        <input
          type="search"
          name="search"
          placeholder="Tìm khóa học theo tên…"
          value={keyword}
          onChange={handleSearch}
        />
      </label>

      <div className="ht-field">
        <label htmlFor={`${id}-category`}>Danh mục</label>
        <Form.Select
          id={`${id}-category`}
          name="categoryId"
          value={value.categoryId ?? ''}
          onChange={handleSelect}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className="ht-field">
        <label htmlFor={`${id}-teacher`}>Giảng viên</label>
        <Form.Select
          id={`${id}-teacher`}
          name="teacherId"
          value={value.teacherId ?? ''}
          onChange={handleSelect}
        >
          <option value="">Tất cả giảng viên</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Form.Select>
      </div>

      <button type="button" className="ht-btn ht-btn--ghost" onClick={handleClear} disabled={!hasFilter}>
        Xóa bộ lọc
      </button>
    </form>
  );
}

export default CourseFilter;
