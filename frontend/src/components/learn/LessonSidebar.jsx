import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListGroup, Button } from 'react-bootstrap';
import { groupLessonsByChapter, groupTitle } from '../../utils/chapters';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Đã hoàn thành" role="img">
    <circle cx="8" cy="8" r="8" fill="#198754" />
    <path d="M4.5 8.2 7 10.6l4.5-4.8" stroke="#fff" strokeWidth="1.8" fill="none"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-label="Đang khóa" role="img" fill="#adb5bd">
    <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12 7h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 6H6V4.5a2 2 0 1 1 4 0V7Z" />
  </svg>
);

const Chevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Học tuần tự (giống F8): bài học nhóm theo chương, mỗi chương gập / mở được.
// Bài đã học có dấu ✓, bài đang học được tô sáng, bài phía sau bị khóa.
function LessonSidebar({ courseId, chapters, lessons, completed, isLocked, currentLessonId, linkState }) {
  const [open, setOpen] = useState(false);
  // Chương người dùng tự gập / mở; mặc định chỉ mở chương chứa bài đang học
  const [toggled, setToggled] = useState({});

  const groups = groupLessonsByChapter(lessons, chapters);
  const hasChapters = groups.some((g) => g.chapter);
  const currentKey = groups.find((g) => g.items.some(({ lesson }) => lesson.id === currentLessonId))?.key;
  const isGroupOpen = (key) => !hasChapters || (toggled[key] ?? key === currentKey);
  const toggleGroup = (key) => setToggled((prev) => ({ ...prev, [key]: !isGroupOpen(key) }));

  const renderLesson = ({ lesson, index }, group, position) => {
    const locked = isLocked(index);
    const label = hasChapters && group.number ? `${group.number}.${position + 1}` : `${index + 1}.`;
    const body = (
      <div className="d-flex align-items-start gap-2">
        <span className="flex-shrink-0">{label}</span>
        <span className="flex-grow-1">{lesson.title}</span>
        <span className="flex-shrink-0 mt-1">
          {completed.has(lesson.id) ? <CheckIcon /> : locked ? <LockIcon /> : null}
        </span>
      </div>
    );

    if (locked) {
      return (
        <ListGroup.Item
          key={lesson.id}
          className="text-muted bg-light small"
          style={{ cursor: 'not-allowed' }}
          title="Hoàn thành các bài học trước để mở khóa bài này"
          aria-disabled="true"
        >
          {body}
        </ListGroup.Item>
      );
    }

    return (
      <ListGroup.Item key={lesson.id} action as={NavLink} className="small"
        to={`/courses/${courseId}/learn/${lesson.id}`}
        replace
        state={linkState}>
        {body}
      </ListGroup.Item>
    );
  };

  return (
    <>
      <Button variant="outline-secondary" className="w-100 d-lg-none mb-2" onClick={() => setOpen(!open)}>
        Nội dung khóa học ({completed.size}/{lessons.length}) {open ? '▲' : '▼'}
      </Button>
      <h2 className="h6 mb-2 d-none d-lg-block">
        Nội dung khóa học <small className="text-muted fw-normal">({completed.size}/{lessons.length})</small>
      </h2>
      <div className={open ? '' : 'd-none d-lg-block'}>
        <ListGroup>
          {groups.map((group) => {
            const groupOpen = isGroupOpen(group.key);
            const done = group.items.filter(({ lesson }) => completed.has(lesson.id)).length;
            return [
              hasChapters && (
                <ListGroup.Item
                  key={`${group.key}-header`}
                  action
                  as="button"
                  type="button"
                  className="bg-body-tertiary"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={groupOpen}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{groupTitle(group)}</div>
                      <small className="text-muted">{done}/{group.items.length} bài</small>
                    </div>
                    <span className="mt-1"><Chevron open={groupOpen} /></span>
                  </div>
                </ListGroup.Item>
              ),
              ...(groupOpen ? group.items.map((item, position) => renderLesson(item, group, position)) : []),
            ];
          })}
        </ListGroup>
      </div>
    </>
  );
}

export default LessonSidebar;
