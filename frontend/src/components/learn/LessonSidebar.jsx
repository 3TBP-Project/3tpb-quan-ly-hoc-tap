import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListGroup, Button } from 'react-bootstrap';

function LessonSidebar({ courseId, lessons, completed, linkState }) {

  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline-secondary" className="w-100 d-lg-none mb-2" onClick={() => setOpen(!open)}>
        Nội dung khóa học ({completed.size}/{lessons.length}) {open ? '▲' : '▼'}
      </Button>
      <h2 className="h6 mb-2 d-none d-lg-block">Nội dung khóa học</h2>
      <div className={open ? '' : 'd-none d-lg-block'}>
        <ListGroup>
          {lessons.map((l) => (
            <ListGroup.Item key={l.id} action as={NavLink} to={`/courses/${courseId}/learn/${l.id}`} replace state={linkState}>
              <span className="me-2">{completed.has(l.id) ? '✓' : '○'}</span>
              {l.title}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </>
  );
}

export default LessonSidebar;