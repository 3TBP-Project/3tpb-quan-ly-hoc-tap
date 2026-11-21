// AI-assisted [AI-14]
import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import {
  createLesson,
  deleteLesson,
  getCourseLessons,
  getTeacherCourses,
  updateLesson,
} from '../services/lessonService';
import { parseApiError } from '../utils/apiError';

const EMPTY_FORM = {
  title: '',
  content: '',
  videoPath: '',
  filePath: '',
  position: 1,
};

function TeacherLessonsPage() {
  const { courseId: routeCourseId } = useParams();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(routeCourseId ? Number(routeCourseId) : '');
  const [lessons, setLessons] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [movingId, setMovingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // 1. Tải danh sách khóa học của giảng viên đang đăng nhập
  useEffect(() => {
    let ignore = false;
    getTeacherCourses()
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setCourses(list);
        if (!routeCourseId && list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      })
      .catch((err) => {
        if (!ignore) setError(parseApiError(err).message);
      })
      .finally(() => {
        if (!ignore) setLoadingCourses(false);
      });

    return () => {
      ignore = true;
    };
  }, [routeCourseId]);

  // 2. Tải danh sách bài học của khóa học được chọn
  const loadLessons = useCallback(async (cid) => {
    if (!cid) return;
    setLoadingLessons(true);
    setError('');
    try {
      const res = await getCourseLessons(cid);
      const list = Array.isArray(res?.data) ? res.data : [];
      setLessons(list);
      setFormData((prev) => ({ ...prev, position: list.length + 1 }));
    } catch (err) {
      setError(parseApiError(err).message);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadLessons(selectedCourseId);
    }
  }, [selectedCourseId, loadLessons]);

  const handleCourseChange = (cid) => {
    setSelectedCourseId(cid);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
  };

  // 3. Thêm mới hoặc Cập nhật bài học (CRUD - Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    if (!formData.title.trim()) {
      setError('Tiêu đề bài học không được để trống.');
      return;
    }

    setError('');
    setNotice('');
    setSavingLesson(true);

    const payload = {
      title: formData.title.trim(),
      content: formData.content || null,
      videoPath: formData.videoPath ? formData.videoPath.trim() : null,
      filePath: formData.filePath ? formData.filePath.trim() : null,
      position: Number(formData.position) || (lessons.length + 1),
    };

    try {
      if (editingId) {
        await updateLesson(editingId, payload);
        setNotice('Cập nhật bài học thành công!');
      } else {
        await createLesson(selectedCourseId, payload);
        setNotice('Thêm bài học mới thành công!');
      }
      setEditingId(null);
      setFormData({ ...EMPTY_FORM, position: lessons.length + 1 });
      await loadLessons(selectedCourseId);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSavingLesson(false);
    }
  };

  // 4. Chọn bài học để chỉnh sửa
  const handleEditClick = (lesson) => {
    setError('');
    setNotice('');
    setEditingId(lesson.id);
    setFormData({
      title: lesson.title || '',
      content: lesson.content || '',
      videoPath: lesson.video_path || lesson.videoPath || lesson.videoUrl || '',
      filePath: lesson.file_path || lesson.filePath || lesson.fileUrl || '',
      position: lesson.position || lesson.order || 1,
    });
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // 5. Hủy chỉnh sửa bài học
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, position: lessons.length + 1 });
    setError('');
    setNotice('');
  };

  // 6. Xóa bài học (CRUD - Delete)
  const handleDeleteClick = async (lessonId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này không?')) return;

    setError('');
    setNotice('');
    try {
      await deleteLesson(lessonId);
      if (editingId === lessonId) {
        handleCancelEdit();
      }
      setNotice('Đã xóa bài học thành công!');
      await loadLessons(selectedCourseId);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  // 7. Sắp xếp thứ tự bài học (Lên / Xuống)
  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const current = lessons[index];
    const target = lessons[targetIndex];

    const currentPos = current.position || (index + 1);
    const targetPos = target.position || (targetIndex + 1);

    // Hoán đổi vị trí nếu bằng nhau
    const newCurrentPos = currentPos === targetPos ? (direction === 'up' ? targetPos : targetPos + 1) : targetPos;
    const newTargetPos = currentPos === targetPos ? (direction === 'up' ? targetPos + 1 : targetPos - 1) : currentPos;

    setMovingId(current.id);
    setError('');
    setNotice('');

    try {
      await updateLesson(current.id, { position: newCurrentPos });
      await updateLesson(target.id, { position: newTargetPos });
      setNotice('Đã cập nhật thứ tự bài học!');
      await loadLessons(selectedCourseId);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Quản lý bài học (HT-10)"
        description="Thêm, sửa, xóa bài học, nhúng video YouTube, đính kèm PDF và sắp xếp thứ tự."
        breadcrumbs={[
          { label: 'Trang chủ', to: '/' },
          { label: 'Giảng viên' },
          { label: 'Quản lý bài học' },
        ]}
      />

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert variant="success" dismissible onClose={() => setNotice('')}>{notice}</Alert>}

      {/* Chọn khóa học của giảng viên */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group as={Row} className="align-items-center">
            <Form.Label column sm={3} md={2} className="fw-semibold">
              Khóa học:
            </Form.Label>
            <Col sm={9} md={7}>
              {loadingCourses ? (
                <Loading />
              ) : courses.length === 0 ? (
                <div className="text-muted">Bạn chưa tạo khóa học nào.</div>
              ) : (
                <Form.Select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(Number(e.target.value))}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (ID: {c.id})
                    </option>
                  ))}
                </Form.Select>
              )}
            </Col>
            {selectedCourseId && (
              <Col sm={12} md={3} className="mt-2 mt-md-0 d-flex gap-2">
                <Link to={`/courses/${selectedCourseId}`} className="btn btn-outline-secondary btn-sm">
                  Xem khóa học
                </Link>
                <Link to={`/courses/${selectedCourseId}/learn`} className="btn btn-outline-primary btn-sm">
                  Vào học thử
                </Link>
              </Col>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {selectedCourseId && (
        <Row className="g-4">
          {/* Cột trái: Form Thêm / Cập nhật bài học */}
          <Col lg={5}>
            <Card className="shadow-sm sticky-top" style={{ top: '80px', zIndex: 10 }}>
              <Card.Header className="bg-primary text-white fw-semibold">
                {editingId ? `Cập nhật bài học #${editingId}` : '+ Thêm bài học mới'}
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Tiêu đề bài học <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tiêu đề bài học..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      maxLength={255}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Thứ tự hiển thị (Position)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      placeholder="1, 2, 3..."
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                      Số nguyên dương thể hiện thứ tự xuất hiện của bài học.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Link Video (YouTube)</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.videoPath}
                      onChange={(e) => setFormData({ ...formData, videoPath: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                      Chỉ lưu link YouTube để nhúng an toàn, không tải tệp video lên server (HT-NFR4).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Đường dẫn tệp PDF / Tài liệu đính kèm</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://... hoặc /files/tailieu.pdf"
                      value={formData.filePath}
                      onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                      Tệp tài liệu đính kèm định dạng PDF tối đa 5 MB (HT-NFR2).
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Nội dung văn bản</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="Nội dung chi tiết bài học..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={savingLesson}>
                      {savingLesson
                        ? 'Đang lưu...'
                        : editingId
                        ? 'Lưu thay đổi'
                        : 'Thêm bài học'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline-secondary" onClick={handleCancelEdit}>
                        Hủy sửa
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải: Danh sách bài học của khóa học */}
          <Col lg={7}>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Danh sách bài học ({lessons.length} bài)</span>
                {editingId && <Badge bg="warning" text="dark">Đang chỉnh sửa</Badge>}
              </Card.Header>

              {loadingLessons ? (
                <Card.Body>
                  <Loading />
                </Card.Body>
              ) : lessons.length === 0 ? (
                <Card.Body className="text-muted text-center py-5">
                  Khóa học này chưa có bài học nào. Hãy điền form bên cạnh để thêm bài đầu tiên!
                </Card.Body>
              ) : (
                <ListGroup variant="flush">
                  {lessons.map((lesson, index) => (
                    <ListGroup.Item
                      key={lesson.id}
                      className={`p-3 ${editingId === lesson.id ? 'bg-light border-primary border-2' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Badge bg="secondary">Bài {index + 1}</Badge>
                            <span className="fw-semibold">{lesson.title}</span>
                          </div>
                          <div className="d-flex flex-wrap gap-1 align-items-center small text-muted">
                            <span>Vị trí: {lesson.position || lesson.order || (index + 1)}</span>
                            <span>•</span>
                            {(lesson.video_path || lesson.videoPath || lesson.videoUrl) ? (
                              <Badge bg="danger" className="text-white">YouTube Video</Badge>
                            ) : (
                              <span className="text-muted">Không có video</span>
                            )}
                            {(lesson.file_path || lesson.filePath || lesson.fileUrl) && (
                              <Badge bg="info">Tệp PDF</Badge>
                            )}
                            {lesson.content && (
                              <Badge bg="light" text="dark" className="border">Văn bản</Badge>
                            )}
                          </div>
                          {lesson.content && (
                            <p className="mt-2 mb-0 small text-secondary text-truncate" style={{ maxWidth: '480px' }}>
                              {lesson.content}
                            </p>
                          )}
                        </div>

                        {/* Nút thao tác: Lên, Xuống, Sửa, Xóa */}
                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={index === 0 || movingId === lesson.id}
                            onClick={() => handleMove(index, 'up')}
                            title="Di chuyển lên"
                          >
                            ▲
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={index === lessons.length - 1 || movingId === lesson.id}
                            onClick={() => handleMove(index, 'down')}
                            title="Di chuyển xuống"
                          >
                            ▼
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(lesson)}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(lesson.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}

export default TeacherLessonsPage;
