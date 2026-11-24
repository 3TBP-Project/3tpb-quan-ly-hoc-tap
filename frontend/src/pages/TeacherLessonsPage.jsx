// AI-assisted [AI-14]
import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Dropdown, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import {
  createCourse,
  createLesson,
  deleteLesson,
  getCourseCategories,
  getCourseChapters,
  getCourseLessons,
  getTeacherCourses,
  swapLessons,
  updateCourseStatus,
  updateLesson,
  updateLessonStatus,
  uploadLessonFile,
} from '../services/lessonService';
import { parseApiError } from '../utils/apiError';
import { groupLessonsByChapter, groupTitle } from '../utils/chapters';
import ChapterManager from '../components/teacher/ChapterManager';
import { getProfile } from '../services/profileService';
import './TeacherLessonsPage.css';

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB (HT-NFR2)

const EMPTY_FORM = {
  title: '',
  content: '',
  videoPath: '',
  position: 1,
  status: 'draft',
  chapterId: '', // '' = không thuộc chương nào
};

const LESSON_STATUS_LABELS = {
  draft: 'Bản nháp',
  public: 'Công khai',
};

const COURSE_STATUS_LABELS = {
  draft: 'Bản nháp',
  public: 'Công khai',
  hidden: 'Bị ẩn bởi quản trị viên',
};

const LESSONS_PER_PAGE = 5;

// Vị trí kế tiếp = vị trí lớn nhất hiện có + 1 (không dựa vào số lượng bài)
const nextPosition = (list) =>
  list.reduce((max, l) => Math.max(max, Number(l.position) || 0), 0) + 1;

const getLessonFilePath = (lesson) => lesson?.file_path || lesson?.filePath || lesson?.fileUrl || '';

// Kiểm tra tệp phía trình duyệt trước khi gửi (server vẫn kiểm tra lại)
const validatePdfFile = (file) => {
  if (!file) return '';
  const isPdf = file.type === 'application/pdf' && /\.pdf$/i.test(file.name);
  if (!isPdf) return 'Chỉ chấp nhận tệp định dạng PDF.';
  if (file.size > MAX_PDF_SIZE) return 'Tệp PDF vượt quá dung lượng tối đa 5 MB.';
  return '';
};

const EMPTY_COURSE_FORM = {
  title: '',
  description: '',
  categoryId: '',
  status: 'draft',
};

function TeacherLessonsPage() {
  const { courseId: routeCourseId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(routeCourseId ? Number(routeCourseId) : '');
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [lessonPage, setLessonPage] = useState(1);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Tệp PDF: tệp mới chọn, có xóa tệp cũ không, key để làm trống ô chọn tệp
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [savingStatus, setSavingStatus] = useState(false);

  // Modal tạo khóa học mới
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE_FORM);
  const [categories, setCategories] = useState([]);
  const [courseFormError, setCourseFormError] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [deleteLessonTarget, setDeleteLessonTarget] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  useEffect(() => {
    let ignore = false;
    getProfile()
      .then((res) => {
        if (!ignore) setMustChangePassword(Boolean(res?.data?.mustChangePassword));
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

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

  // 1b. Mở modal tạo khóa học, tải danh mục nếu chưa có
  const openCourseModal = async () => {
    if (mustChangePassword) {
      setError('Bạn phải đổi mật khẩu tạm trong Hồ sơ trước khi tạo khóa học.');
      navigate('/profile');
      return;
    }
    setCourseForm(EMPTY_COURSE_FORM);
    setCourseFormError('');
    setShowCourseModal(true);
    if (categories.length > 0) return;
    try {
      const res = await getCourseCategories();
      const list = Array.isArray(res?.data) ? res.data : [];
      setCategories(list);
      if (list.length === 0) setCourseFormError('Chưa có danh mục nào. Vui lòng liên hệ quản trị viên.');
    } catch (err) {
      setCourseFormError(parseApiError(err).message);
    }
  };

  // 1c. Tạo khóa học rồi chọn luôn khóa học vừa tạo để thêm bài học
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const title = courseForm.title.trim();
    if (!title) {
      setCourseFormError('Tên khóa học không được để trống.');
      return;
    }
    if (!courseForm.categoryId) {
      setCourseFormError('Vui lòng chọn danh mục.');
      return;
    }

    setSavingCourse(true);
    setCourseFormError('');
    try {
      const res = await createCourse({
        title,
        description: courseForm.description.trim() || null,
        category_id: Number(courseForm.categoryId),
        status: courseForm.status,
      });
      const newId = Number(res?.data?.id);
      const listRes = await getTeacherCourses();
      setCourses(Array.isArray(listRes?.data) ? listRes.data : []);
      setShowCourseModal(false);
      setError('');
      setNotice(`Đã tạo khóa học "${title}". Bạn có thể thêm bài học ngay bây giờ.`);
      if (newId) handleCourseChange(newId);
    } catch (err) {
      setCourseFormError(parseApiError(err).message);
    } finally {
      setSavingCourse(false);
    }
  };

  // 2. Tải danh sách bài học của khóa học được chọn
  const loadLessons = useCallback(async (cid, { keepForm = false } = {}) => {
    if (!cid) return;
    setLoadingLessons(true);
    setError('');
    try {
      const [lessonRes, chapterRes] = await Promise.all([
        getCourseLessons(cid),
        getCourseChapters(cid),
      ]);
      const list = Array.isArray(lessonRes?.data) ? lessonRes.data : [];
      setLessons(list);
      setChapters(Array.isArray(chapterRes?.data) ? chapterRes.data : []);
      if (!keepForm) setFormData((prev) => ({ ...prev, position: nextPosition(list) }));
    } catch (err) {
      setError(parseApiError(err).message);
      setLessons([]);
      setChapters([]);
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

  const resetFileInput = () => {
    setPdfFile(null);
    setPdfError('');
    setRemoveExistingFile(false);
    setFileInputKey((k) => k + 1);
  };

  const handleCourseChange = (cid) => {
    setSelectedCourseId(cid);
    setLessonPage(1);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    resetFileInput();
  };

  const selectedCourse = courses.find((c) => Number(c.id) === Number(selectedCourseId));
  // Khóa học không nằm trong danh sách của giảng viên (vd. mở link /teacher/courses/:id/lessons
  // của người khác) thì chỉ được xem, không được sửa trạng thái hay bài học
  const isReadOnly = Boolean(selectedCourseId) && !loadingCourses && !selectedCourse;
  const editingLesson = editingId ? lessons.find((l) => l.id === editingId) : null;
  // Chương đang chọn trong form (bỏ qua nếu chương vừa bị xóa)
  const selectedChapterId = chapters.some((c) => String(c.id) === String(formData.chapterId))
    ? String(formData.chapterId)
    : '';
  const lessonGroups = groupLessonsByChapter(lessons, chapters, { includeEmpty: true });
  const hasChapters = chapters.length > 0;
  const existingFilePath = getLessonFilePath(editingLesson);
  const publicLessonCount = lessons.filter((lesson) => lesson.status === 'public').length;
  const lessonTotalPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const pagedLessons = lessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );
  const pagedLessonIds = new Set(pagedLessons.map((lesson) => Number(lesson.id)));
  const pagedLessonGroups = lessonGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(({ lesson }) => pagedLessonIds.has(Number(lesson.id))),
    }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    if (lessonTotalPages > 0 && lessonPage > lessonTotalPages) {
      setLessonPage(lessonTotalPages);
    }
  }, [lessonPage, lessonTotalPages]);

  // Bài học khác đang giữ vị trí đang nhập (bỏ qua chính bài đang sửa)
  const positionValue = Number(formData.position);
  const positionConflict = Number.isInteger(positionValue) && positionValue > 0
    ? lessons.find((l) => Number(l.position) === positionValue && l.id !== editingId)
    : null;

  // 2b. Đổi trạng thái khóa học: Bản nháp / Công khai
  const handleStatusChange = async (status) => {
    if (isReadOnly || !selectedCourse || status === selectedCourse.status) return;
    setSavingStatus(true);
    setError('');
    setNotice('');
    try {
      await updateCourseStatus(selectedCourse.id, status);
      setCourses((prev) => prev.map((c) => (c.id === selectedCourse.id ? { ...c, status } : c)));
      setNotice(`Đã chuyển khóa học sang trạng thái "${COURSE_STATUS_LABELS[status]}".`);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0] || null;
    const message = validatePdfFile(file);
    setPdfError(message);
    setPdfFile(message ? null : file);
    if (message) setFileInputKey((k) => k + 1);
  };

  // 3. Thêm mới hoặc Cập nhật bài học (CRUD - Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || isReadOnly) return;

    if (!formData.title.trim()) {
      setError('Tiêu đề bài học không được để trống.');
      return;
    }
    if (!Number.isInteger(positionValue) || positionValue < 1) {
      setError('Thứ tự hiển thị phải là số nguyên dương.');
      return;
    }
    if (positionConflict) {
      setError(`Vị trí ${positionValue} đã có bài học "${positionConflict.title}". Vui lòng chọn vị trí khác.`);
      return;
    }

    setError('');
    setNotice('');
    setSavingLesson(true);

    const payload = {
      title: formData.title.trim(),
      content: formData.content || null,
      videoPath: formData.videoPath ? formData.videoPath.trim() : null,
      position: positionValue,
      status: formData.status === 'public' ? 'public' : 'draft',
      chapterId: selectedChapterId === '' ? null : Number(selectedChapterId),
    };
    // Xóa tệp cũ khi giảng viên tick "Xóa tệp hiện tại" mà không chọn tệp mới
    if (editingId && removeExistingFile && !pdfFile) payload.filePath = null;

    let savedLessonId = editingId;
    try {
      if (editingId) {
        await updateLesson(editingId, payload);
      } else {
        const res = await createLesson(selectedCourseId, payload);
        savedLessonId = res?.data?.id;
      }
    } catch (err) {
      setError(parseApiError(err).message);
      setSavingLesson(false);
      return;
    }

    let uploadFailed = '';
    if (pdfFile && savedLessonId) {
      try {
        await uploadLessonFile(savedLessonId, pdfFile);
      } catch (err) {
        uploadFailed = parseApiError(err).message;
      }
    }

    if (uploadFailed) {
      setError(`Đã lưu bài học nhưng tải tệp PDF thất bại: ${uploadFailed}`);
    } else {
      setNotice(editingId ? 'Cập nhật bài học thành công!' : 'Thêm bài học mới thành công!');
    }
    setEditingId(null);
    // Giữ nguyên chương đã chọn để thêm liên tiếp nhiều bài vào cùng một chương
    setFormData({ ...EMPTY_FORM, chapterId: selectedChapterId });
    resetFileInput();
    await loadLessons(selectedCourseId);
    setSavingLesson(false);
  };

  // 4. Chọn bài học để chỉnh sửa
  const handleEditClick = (lesson) => {
    if (isReadOnly) return;
    setError('');
    setNotice('');
    setEditingId(lesson.id);
    resetFileInput();
    setFormData({
      title: lesson.title || '',
      content: lesson.content || '',
      videoPath: lesson.video_path || lesson.videoPath || lesson.videoUrl || '',
      position: lesson.position || lesson.order || 1,
      status: lesson.status === 'public' ? 'public' : 'draft',
      chapterId: lesson.chapterId == null ? '' : String(lesson.chapterId),
    });
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // 5. Hủy chỉnh sửa bài học
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, position: nextPosition(lessons) });
    resetFileInput();
    setError('');
    setNotice('');
  };

  // 6. Xóa bài học (CRUD - Delete)
  const handleDeleteClick = async (lessonId) => {
    if (isReadOnly) return;
    setDeleteLessonTarget(lessonId);
  };

  const confirmDeleteLesson = async () => {
    if (isReadOnly || deleteLessonTarget == null) return;
    setError('');
    setNotice('');
    setDeletingLesson(true);
    try {
      await deleteLesson(deleteLessonTarget);
      if (editingId === deleteLessonTarget) {
        handleCancelEdit();
      }
      setNotice('Đã xóa bài học thành công!');
      await loadLessons(selectedCourseId, { keepForm: Boolean(editingId && editingId !== deleteLessonTarget) });
      setDeleteLessonTarget(null);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setDeletingLesson(false);
    }
  };

  // 6b. Đổi nhanh trạng thái bài học: Bản nháp <-> Công khai
  const handleToggleLessonStatus = async (lesson) => {
    if (isReadOnly) return;
    const status = lesson.status === 'public' ? 'draft' : 'public';
    setTogglingId(lesson.id);
    setError('');
    setNotice('');
    try {
      await updateLessonStatus(lesson.id, status);
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, status } : l)));
      if (editingId === lesson.id) setFormData((prev) => ({ ...prev, status }));
      setNotice(`Đã chuyển bài "${lesson.title}" sang trạng thái "${LESSON_STATUS_LABELS[status]}".`);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setTogglingId(null);
    }
  };

  // 7. Sắp xếp thứ tự bài học (Lên / Xuống) trong cùng một chương -
  //    server đổi chỗ hai bài trong một giao dịch
  const handleMove = async (current, target) => {
    if (isReadOnly || !current || !target) return;

    setMovingId(current.id);
    setError('');
    setNotice('');

    try {
      await swapLessons(current.id, target.id);
      setNotice('Đã cập nhật thứ tự bài học!');
      await loadLessons(selectedCourseId, { keepForm: Boolean(editingId) });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Quản lý bài học"
        subtitle="Thêm, sửa, xóa bài học, nhúng video YouTube, đính kèm PDF, sắp xếp thứ tự và công khai bài học."
        actions={(
          <Button variant="primary" onClick={openCourseModal}>
            + Tạo khóa học
          </Button>
        )}
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
                <span className="text-muted">
                  Bạn chưa tạo khóa học nào. Bấm “+ Tạo khóa học” ở góc phải để bắt đầu.
                </span>
              ) : (
                <Dropdown
                  className="w-100"
                  onSelect={(value) => handleCourseChange(Number(value))}
                >
                  <Dropdown.Toggle
                    id="teacher-course-lessons-dropdown"
                    variant="outline-secondary"
                    className="w-100 text-start d-flex justify-content-between align-items-center"
                  >
                    {isReadOnly
                      ? 'Khóa học ngoài quyền quản lý'
                      : courses.find((c) => c.id === selectedCourseId)?.title || 'Chọn khóa học'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="w-100"
                    style={{ maxHeight: '240px', overflowY: 'auto' }}
                  >
                    {isReadOnly && (
                      <Dropdown.Item eventKey={selectedCourseId} active>
                        Khóa học ngoài quyền quản lý
                      </Dropdown.Item>
                    )}
                    {courses.map((c) => (
                      <Dropdown.Item
                        key={c.id}
                        eventKey={c.id}
                        active={c.id === selectedCourseId}
                      >
                        {c.title}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Col>
            {selectedCourseId && (
              <Col sm={12} md={3} className="mt-2 mt-md-0 d-flex flex-wrap gap-2">
                <Link to={`/courses/${selectedCourseId}`} className="btn btn-outline-secondary btn-sm">
                  Xem khóa học
                </Link>
              </Col>
            )}
          </Form.Group>

          {(selectedCourse || isReadOnly) && (
            <Form.Group as={Row} className="align-items-center mt-3">
              <Form.Label column sm={3} md={2} className="fw-semibold">
                Trạng thái:
              </Form.Label>
              <Col sm={9} md={7}>
                {isReadOnly ? (
                  <span className="text-muted">
                    Không thể chỉnh sửa vì đây không phải khóa học của bạn.
                  </span>
                ) : selectedCourse.status === 'hidden' ? (
                  <Badge bg="dark">{COURSE_STATUS_LABELS.hidden}</Badge>
                ) : (
                  <>
                    <Form.Select
                      value={selectedCourse.status === 'public' ? 'public' : 'draft'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={savingStatus}
                    >
                      <option value="draft">Bản nháp (draft) - học viên chưa thấy</option>
                      <option value="public" disabled={publicLessonCount < 1}>
                        Công khai (public) - hiển thị cho học viên
                      </option>
                    </Form.Select>
                    {publicLessonCount < 1 && (
                      <Form.Text className="text-danger">
                        Hãy công khai ít nhất một bài học trước khi công khai khóa học.
                      </Form.Text>
                    )}
                  </>
                )}
              </Col>
            </Form.Group>
          )}
        </Card.Body>
      </Card>

      {isReadOnly && (
        <Alert variant="warning">
          Bạn không phải giảng viên của khóa học này nên chỉ có thể xem danh sách bài học,
          không thể thêm, sửa, xóa hay đổi trạng thái.
        </Alert>
      )}

      {selectedCourseId && (
        <ChapterManager
          courseId={selectedCourseId}
          chapters={chapters}
          lessons={lessons}
          readOnly={isReadOnly}
          onChanged={() => loadLessons(selectedCourseId, { keepForm: true })}
          onError={setError}
          onNotice={setNotice}
        />
      )}

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
                  <fieldset disabled={isReadOnly}>
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
                    <Form.Label className="fw-semibold">Chương</Form.Label>
                    <Form.Select
                      value={selectedChapterId}
                      onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                    >
                      <option value="">-- Không thuộc chương nào --</option>
                      {chapters.map((c, i) => (
                        <option key={c.id} value={String(c.id)}>Chương {i + 1}. {c.title}</option>
                      ))}
                    </Form.Select>
                    {!hasChapters && (
                      <Form.Text className="text-muted">
                        Tạo chương ở khung “Chương học” phía trên để nhóm bài học.
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Thứ tự hiển thị (Position)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      placeholder="1, 2, 3..."
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      isInvalid={Boolean(positionConflict)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {positionConflict &&
                        `Vị trí ${positionValue} đã có bài học "${positionConflict.title}". Vui lòng chọn vị trí khác.`}
                    </Form.Control.Feedback>
                    {!positionConflict && (
                      <Form.Text className="text-muted">
                        Số nguyên dương, sắp xếp bài trong cùng chương (số nhỏ đứng trước). Mỗi vị trí chỉ có một bài.
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Trạng thái bài học</Form.Label>
                    <Form.Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Bản nháp (draft) - học viên chưa thấy</option>
                      <option value="public">Công khai (public) - hiển thị cho học viên</option>
                    </Form.Select>
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
                      Chỉ lưu link YouTube để nhúng an toàn, không tải tệp video lên server.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Tài liệu đính kèm (PDF)</Form.Label>
                    {existingFilePath && !pdfFile && (
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2 small">
                        <Badge bg={removeExistingFile ? 'secondary' : 'info'}>
                          {removeExistingFile ? 'Tệp PDF sẽ bị xóa' : 'Đã có tệp PDF'}
                        </Badge>
                        <Form.Check
                          type="checkbox"
                          id="remove-lesson-pdf"
                          label="Xóa tệp hiện tại"
                          checked={removeExistingFile}
                          onChange={(e) => setRemoveExistingFile(e.target.checked)}
                        />
                      </div>
                    )}
                    <Form.Control
                      key={fileInputKey}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfChange}
                      isInvalid={Boolean(pdfError)}
                    />
                    <Form.Control.Feedback type="invalid">{pdfError}</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {pdfFile
                        ? `Đã chọn: ${pdfFile.name} (${(pdfFile.size / 1024 / 1024).toFixed(2)} MB)`
                        : existingFilePath
                        ? 'Chọn tệp mới nếu muốn thay tệp hiện tại. Chỉ nhận PDF, tối đa 5 MB.'
                        : 'Chỉ nhận tệp PDF, tối đa 5 MB.'}
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
                    <Button type="submit" variant="primary" disabled={savingLesson || Boolean(positionConflict)}>
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
                  </fieldset>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải: Danh sách bài học của khóa học */}
          <Col lg={7}>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  Danh sách bài học ({lessons.length} bài
                  {lessons.length > 0 && `, ${lessons.filter((l) => l.status === 'public').length} công khai`})
                </span>
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
                <>
                <ListGroup variant="flush">
                  {pagedLessonGroups.map((group) => [
                    hasChapters && (
                      <ListGroup.Item
                        key={`${group.key}-header`}
                        className="bg-body-tertiary d-flex justify-content-between align-items-center"
                      >
                        <span className="fw-semibold">{groupTitle(group)}</span>
                        <small className="text-muted">{group.items.length} bài</small>
                      </ListGroup.Item>
                    ),
                    hasChapters && group.items.length === 0 && (
                      <ListGroup.Item key={`${group.key}-empty`} className="small text-muted fst-italic">
                        Chưa có bài học nào trong chương này.
                      </ListGroup.Item>
                    ),
                    ...group.items.map(({ lesson, index }, position) => {
                      // Lên / xuống chỉ đổi chỗ với bài liền kề trong cùng chương
                      const prevLesson = group.items[position - 1]?.lesson;
                      const nextLesson = group.items[position + 1]?.lesson;
                      const lessonLabel = group.number ? `${group.number}.${position + 1}` : `${index + 1}`;
                      return (
                    <ListGroup.Item
                      key={lesson.id}
                      className={`p-3 ${editingId === lesson.id ? 'bg-light border-primary border-2' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-center gap-2 mb-1" style={{ minWidth: 0 }}>
                            <Badge bg="secondary" className="flex-shrink-0">Bài {lessonLabel}</Badge>
                            <Badge
                              bg={lesson.status === 'public' ? 'success' : 'warning'}
                              text={lesson.status === 'public' ? undefined : 'dark'}
                              className="flex-shrink-0"
                            >
                              {LESSON_STATUS_LABELS[lesson.status] || LESSON_STATUS_LABELS.draft}
                            </Badge>
                            <span
                              className="fw-semibold text-truncate"
                              style={{ minWidth: 0 }}
                              title={lesson.title}
                            >
                              {lesson.title}
                            </span>
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
                            disabled={isReadOnly || !prevLesson || movingId === lesson.id}
                            onClick={() => handleMove(lesson, prevLesson)}
                            title="Di chuyển lên"
                          >
                            ▲
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={isReadOnly || !nextLesson || movingId === lesson.id}
                            onClick={() => handleMove(lesson, nextLesson)}
                            title="Di chuyển xuống"
                          >
                            ▼
                          </Button>
                          <Button
                            size="sm"
                            variant={lesson.status === 'public' ? 'outline-warning' : 'outline-success'}
                            onClick={() => handleToggleLessonStatus(lesson)}
                            disabled={isReadOnly || togglingId === lesson.id}
                            title={lesson.status === 'public'
                              ? 'Chuyển về bản nháp (ẩn với học viên)'
                              : 'Công khai cho học viên'}
                          >
                            {lesson.status === 'public' ? 'Về nháp' : 'Công khai'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(lesson)}
                            disabled={isReadOnly}
                          >
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteClick(lesson.id)}
                            disabled={isReadOnly}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                      );
                    }),
                  ])}
                </ListGroup>
                <div className="border-top px-3 py-3">
                  <Pagination
                    page={lessonPage}
                    totalPages={lessonTotalPages}
                    onPageChange={setLessonPage}
                  />
                </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        show={deleteLessonTarget != null}
        onHide={() => !deletingLesson && setDeleteLessonTarget(null)}
        centered
        className="lesson-confirm-modal"
      >
        <Modal.Header closeButton={!deletingLesson}>
          <Modal.Title as="h2" className="lesson-confirm-title">Xác nhận xóa bài học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa bài học này không?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setDeleteLessonTarget(null)}
            disabled={deletingLesson}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteLesson}
            disabled={deletingLesson}
          >
            {deletingLesson ? 'Đang xóa...' : 'Xóa bài học'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCourseModal} onHide={() => !savingCourse && setShowCourseModal(false)} centered>
        <Form onSubmit={handleCreateCourse}>
          <Modal.Header closeButton={!savingCourse}>
            <Modal.Title>Tạo khóa học mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {courseFormError && <Alert variant="danger">{courseFormError}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Tên khóa học <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Lập trình ReactJS cơ bản"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                maxLength={255}
                autoFocus
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Danh mục <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={courseForm.categoryId}
                onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Giới thiệu ngắn về khóa học..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-semibold">Trạng thái</Form.Label>
              <Form.Select
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
              >
                <option value="draft">Nháp (chưa hiển thị cho học viên)</option>
                <option value="public">Công khai</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowCourseModal(false)}
              disabled={savingCourse}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={savingCourse}>
              {savingCourse ? 'Đang tạo...' : 'Tạo khóa học'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default TeacherLessonsPage;
