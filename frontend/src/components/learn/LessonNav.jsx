import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LessonNav({ courseId, prev, next, isCompleted, saving, onComplete }) {
  const link = (lesson) => `/courses/${courseId}/learn/${lesson.id}`;
  return (
    <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-4">
      {prev ? <Button as={Link} to={link(prev)} variant="outline-secondary">‹ Bài trước</Button> : <span />}
      <Button variant={isCompleted ? 'success' : 'primary'} disabled={isCompleted || saving} onClick={onComplete}>
        {isCompleted ? 'Đã hoàn thành ✓' : saving ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
      </Button>
      {next ? <Button as={Link} to={link(next)} variant="outline-secondary">Bài sau ›</Button> : <span />}
    </div>
  );
}

export default LessonNav;