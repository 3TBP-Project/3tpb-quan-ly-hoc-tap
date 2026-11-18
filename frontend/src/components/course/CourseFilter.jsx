// AI-assisted [AI-08]
import { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';

const SEARCH_DELAY = 400; // ms, tránh gọi API sau mỗi phím gõ

/**
 * Thanh tìm kiếm và lọc khóa học (wireframe màn 01).
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

  // Hủy hẹn giờ khi gỡ component
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleSearch = (e) => {
    const text = e.target.value;
    setKeyword(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange({ search: text.trim() }), SEARCH_DELAY);
  };

  const handleSelect = (e) => onChange({ [e.target.name]: e.target.value });

  const hasFilter = keyword !== '' || value.categoryId || value.teacherId;

  const handleClear = () => {
    clearTimeout(timer.current);
    setKeyword('');
    onChange({ search: '', categoryId: '', teacherId: '' });
  };

  return (
    <Form
      role="search"
      className="bg-light border rounded p-3 mb-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <Row className="g-2 align-items-center">
        <Col xs={12} md>
          <Form.Control
            type="search"
            name="search"
            placeholder="Tìm khóa học theo tên..."
            aria-label="Tìm khóa học theo tên"
            value={keyword}
            onChange={handleSearch}
          />
        </Col>
        <Col xs={12} sm={6} md="auto">
          <Form.Select
            name="categoryId"
            aria-label="Danh mục"
            value={value.categoryId ?? ''}
            onChange={handleSelect}
          >
            <option value="">Danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} sm={6} md="auto">
          <Form.Select
            name="teacherId"
            aria-label="Giảng viên"
            value={value.teacherId ?? ''}
            onChange={handleSelect}
          >
            <option value="">Giảng viên (A–Z)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        {hasFilter && (
          <Col xs={12} md="auto">
            <Button variant="outline-secondary" className="w-100" onClick={handleClear}>
              Xóa bộ lọc
            </Button>
          </Col>
        )}
      </Row>
    </Form>
  );
}

export default CourseFilter;
