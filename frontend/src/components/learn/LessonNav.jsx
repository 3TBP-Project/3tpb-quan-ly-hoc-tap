// AI-assisted [AI-15]
import { Link } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';

// Chuyển bài thêm 1 mục lịch sử để nút Back của trình duyệt lùi về bài trước đó.
// Học tuần tự: chưa hoàn thành bài hiện tại thì nút "Bài sau" bị khóa.
function LessonNav({ courseId, prev, next, isCompleted, saving, onComplete, linkState }) {
  const link = (lesson) => `/courses/${courseId}/learn/${lesson.id}`;
  return (
    <Row className="g-2 mt-4 align-items-center">
      <Col xs={12} md="auto" className="order-md-2">
        <Button className="w-100" variant={isCompleted ? 'success' : 'primary'} disabled={isCompleted || saving} onClick={onComplete}>
          {isCompleted ? 'Đã hoàn thành ✓' : saving ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
        </Button>
      </Col>
      <Col xs={6} md className="order-md-1">
        {prev && <Button as={Link} to={link(prev)} replace state={linkState} variant="outline-secondary" className="w-100 w-md-auto">‹ Bài trước</Button>}
      </Col>
      <Col xs={6} md className="order-md-3 text-end">
        {next && (isCompleted ? (
          <Button as={Link} to={link(next)} replace state={linkState} variant="outline-secondary" className="w-100 w-md-auto">Bài sau ›</Button>
        ) : (
          <span title="Hoàn thành bài này để mở khóa bài tiếp theo" className="d-inline-block w-100 w-md-auto">
            <Button variant="outline-secondary" className="w-100 w-md-auto" disabled style={{ pointerEvents: 'none' }}>
              🔒 Bài sau
            </Button>
          </span>
        ))}
      </Col>
    </Row>
  );
}

export default LessonNav;
