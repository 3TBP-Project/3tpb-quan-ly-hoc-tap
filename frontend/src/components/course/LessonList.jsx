import { ListGroup, Badge } from 'react-bootstrap';
import { groupLessonsByChapter, groupTitle } from '../../utils/chapters';

// Danh sách bài học ở trang chi tiết khóa học, nhóm theo chương (nếu khóa học có chương)
function LessonList({ lessons, chapters, unlocked }) {
  if (!lessons.length) return <p className="text-muted">Khóa học chưa có bài học.</p>;

  const groups = groupLessonsByChapter(lessons, chapters);
  const hasChapters = groups.some((g) => g.chapter);

  const renderLesson = ({ lesson }, label) => (
    <ListGroup.Item key={lesson.id} className="d-flex justify-content-between align-items-center gap-2">
      <span>
        <span className="text-muted me-2">{label}</span>
        {lesson.title}
      </span>
      {!unlocked && <Badge bg="secondary">Khóa</Badge>}
    </ListGroup.Item>
  );

  if (!hasChapters) {
    return (
      <ListGroup>
        {groups[0].items.map((item) => renderLesson(item, `${item.index + 1}.`))}
      </ListGroup>
    );
  }

  return (
    <>
      <p className="text-muted small mb-2">
        {groups.filter((g) => g.chapter).length} chương • {lessons.length} bài học
      </p>
      {groups.map((group) => (
        <div key={group.key} className="mb-3">
          <div className="d-flex justify-content-between align-items-center bg-body-tertiary border rounded-top px-3 py-2">
            <span className="fw-semibold">{groupTitle(group)}</span>
            <small className="text-muted">{group.items.length} bài</small>
          </div>
          <ListGroup className="rounded-top-0">
            {group.items.map((item, position) =>
              renderLesson(item, group.number ? `${group.number}.${position + 1}` : `${item.index + 1}.`))}
          </ListGroup>
        </div>
      ))}
    </>
  );
}

export default LessonList;
