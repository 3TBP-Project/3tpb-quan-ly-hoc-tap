import { ListGroup, Badge } from 'react-bootstrap';

function LessonList({ lessons, unlocked }) {
  if (!lessons.length) return <p className="text-muted">Khóa học chưa có bài học.</p>;
  return (
    <ListGroup>
      {lessons.map((l) => (
        <ListGroup.Item key={l.id} className="d-flex justify-content-between align-items-center">
          <span>{l.title}</span>
          {!unlocked && <Badge bg="secondary">Khóa</Badge>}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default LessonList;