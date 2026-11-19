import { NavLink } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';

function LessonSidebar({ courseId, lessons, completed }) {
  return (
    <>
      <h2 className="h6 mb-2">Nội dung khóa học</h2>
      <ListGroup>
        {lessons.map((l) => (
          <ListGroup.Item key={l.id} action as={NavLink} to={`/courses/${courseId}/learn/${l.id}`}>
            <span className="me-2">{completed.has(l.id) ? '✓' : '○'}</span>
            {l.title}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

export default LessonSidebar;