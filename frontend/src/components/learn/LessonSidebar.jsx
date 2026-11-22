import { useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { ListGroup, Button } from 'react-bootstrap';

function LessonSidebar({ courseId, lessons, completed, linkState }) {
  const { lessonId } = useParams();
  const location = useLocation();

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
            <ListGroup.Item key={l.id} action as={NavLink} to={`/courses/${courseId}/learn/${l.id}`}
              // Bấm lại bài đang xem thì không thêm mục lịch sử; bài khác thì thêm để Back lùi về được
              replace={l.id === Number(lessonId)}
              state={l.id === Number(lessonId) ? location.state : linkState}>
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