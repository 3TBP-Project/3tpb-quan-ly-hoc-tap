// AI-assisted
import { useState } from 'react';
import { Button, Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { createChapter, deleteChapter, renameChapter, swapChapters } from '../../services/lessonService';
import { parseApiError } from '../../utils/apiError';

// Quản lý chương của một khóa học: thêm, đổi tên, xóa, đổi thứ tự.
// Sau mỗi thao tác gọi onChanged() để trang cha tải lại chương + bài học.
function ChapterManager({ courseId, chapters, lessons, readOnly, onChanged, onError, onNotice }) {
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [busyId, setBusyId] = useState(null); // 'new' | id chương đang xử lý

  const lessonCount = (chapterId) =>
    lessons.filter((l) => Number(l.chapterId ?? l.chapter_id) === Number(chapterId)).length;

  const run = async (busyKey, action, successMessage) => {
    setBusyId(busyKey);
    onError('');
    onNotice('');
    try {
      await action();
      await onChanged();
      if (successMessage) onNotice(successMessage);
      return true;
    } catch (err) {
      onError(parseApiError(err).message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const ok = await run('new', () => createChapter(courseId, title), `Đã thêm chương "${title}".`);
    if (ok) setNewTitle('');
  };

  const handleRename = async (chapter) => {
    const title = editingTitle.trim();
    if (!title || title === chapter.title) {
      setEditingId(null);
      return;
    }
    const ok = await run(chapter.id, () => renameChapter(chapter.id, title), 'Đã đổi tên chương.');
    if (ok) setEditingId(null);
  };

  const handleDelete = async (chapter) => {
    const count = lessonCount(chapter.id);
    const message = count > 0
      ? `Xóa chương "${chapter.title}"? ${count} bài học trong chương sẽ được giữ lại và chuyển sang "Bài học chưa phân chương".`
      : `Xóa chương "${chapter.title}"?`;
    if (!window.confirm(message)) return;
    await run(chapter.id, () => deleteChapter(chapter.id), 'Đã xóa chương.');
  };

  const handleMove = (index, direction) => {
    const target = chapters[direction === 'up' ? index - 1 : index + 1];
    if (!target) return;
    run(chapters[index].id, () => swapChapters(chapters[index].id, target.id), 'Đã cập nhật thứ tự chương.');
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="fw-semibold">Chương học ({chapters.length})</Card.Header>
      {chapters.length > 0 && (
        <ListGroup variant="flush">
          {chapters.map((chapter, index) => (
            <ListGroup.Item key={chapter.id} className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted flex-shrink-0">Chương {index + 1}.</span>
              {editingId === chapter.id ? (
                <Form
                  className="flex-grow-1"
                  onSubmit={(e) => { e.preventDefault(); handleRename(chapter); }}
                >
                  <InputGroup size="sm">
                    <Form.Control
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      maxLength={255}
                      autoFocus
                      aria-label="Tên chương mới"
                    />
                    <Button type="submit" variant="primary" disabled={busyId === chapter.id}>Lưu</Button>
                    <Button variant="outline-secondary" onClick={() => setEditingId(null)}>Hủy</Button>
                  </InputGroup>
                </Form>
              ) : (
                <>
                  <span className="fw-semibold flex-grow-1 text-break">{chapter.title}</span>
                  <small className="text-muted">{lessonCount(chapter.id)} bài</small>
                  <div className="d-flex gap-1">
                    <Button size="sm" variant="outline-secondary" title="Di chuyển lên"
                      disabled={readOnly || index === 0 || busyId !== null}
                      onClick={() => handleMove(index, 'up')}>▲</Button>
                    <Button size="sm" variant="outline-secondary" title="Di chuyển xuống"
                      disabled={readOnly || index === chapters.length - 1 || busyId !== null}
                      onClick={() => handleMove(index, 'down')}>▼</Button>
                    <Button size="sm" variant="outline-primary" disabled={readOnly || busyId !== null}
                      onClick={() => { setEditingId(chapter.id); setEditingTitle(chapter.title); }}>
                      Đổi tên
                    </Button>
                    <Button size="sm" variant="outline-danger" disabled={readOnly || busyId !== null}
                      onClick={() => handleDelete(chapter)}>
                      Xóa
                    </Button>
                  </div>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Card.Body>
        <Form onSubmit={handleAdd}>
          <InputGroup>
            <Form.Control
              placeholder="Tên chương mới, ví dụ: Làm quen với HTML"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={255}
              disabled={readOnly}
              aria-label="Tên chương mới"
            />
            <Button type="submit" variant="outline-primary" disabled={readOnly || !newTitle.trim() || busyId === 'new'}>
              {busyId === 'new' ? 'Đang thêm...' : '+ Thêm chương'}
            </Button>
          </InputGroup>
          {chapters.length === 0 && (
            <Form.Text className="text-muted">
              Khóa học chưa có chương. Tạo chương để nhóm bài học giống mục lục khóa học.
            </Form.Text>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ChapterManager;
