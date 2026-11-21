// AI-assisted [AI-15]
import { Link } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';

// Chuyển bài dùng replace để cả trang học chỉ chiếm 1 mục trong lịch sử trình duyệt
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
        {next && <Button as={Link} to={link(next)} replace state={linkState} variant="outline-secondary" className="w-100 w-md-auto">Bài sau ›</Button>}
      </Col>
    </Row>
  );
}

export default LessonNav;