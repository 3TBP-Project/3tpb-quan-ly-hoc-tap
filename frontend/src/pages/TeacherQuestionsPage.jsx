// AI-assisted [AI-13]
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Dropdown, Form, ListGroup, Row } from 'react-bootstrap';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  createCourseQuestion,
  deleteCourseQuestion,
  getCourseQuestions,
  getTeacherCourses,
  updateCourseQuestion,
  updateCourseQuizDuration,
} from '../services/questionService';
import { parseApiError } from '../utils/apiError';
import { getProfile } from '../services/profileService';

const LETTERS = ['A', 'B', 'C', 'D'];
const EMPTY_FORM = {
  content: '',
  options: ['', '', '', ''],
  correctIndex: 0,
};

const OPTION_ORDER_PREFIX = 'teacher_question_order_v1_';

const saveQuestionOptionOrder = (questionId, options, correctIndex) => {
  try {
    if (!questionId || !Array.isArray(options) || options.length !== 4) return;
    localStorage.setItem(
      `${OPTION_ORDER_PREFIX}${questionId}`,
      JSON.stringify({
        options: options.map((opt) => String(opt ?? '').trim()),
        correctIndex: Number(correctIndex),
      })
    );
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
};

const applySavedOptionOrder = (q) => {
  try {
    const raw = localStorage.getItem(`${OPTION_ORDER_PREFIX}${q.id}`);
    if (!raw) return q;
    const saved = JSON.parse(raw);
    if (
      !Array.isArray(saved?.options) ||
      saved.options.length !== 4 ||
      !Number.isInteger(saved?.correctIndex) ||
      saved.correctIndex < 0 ||
      saved.correctIndex > 3
    ) {
      return q;
    }

    const expectedCorrect = String(q.correctAnswer ?? '').trim();
    if (saved.options[saved.correctIndex]?.trim() !== expectedCorrect) {
      return q;
    }

    const currentSorted = [...(q.options || [])].map((s) => String(s ?? '').trim()).sort();
    const savedSorted = [...saved.options].map((s) => String(s ?? '').trim()).sort();
    if (JSON.stringify(currentSorted) !== JSON.stringify(savedSorted)) {
      return q;
    }

    return {
      ...q,
      options: saved.options,
      correctIndex: saved.correctIndex,
    };
  } catch {
    return q;
  }
};

function TeacherQuestionsPage() {
  const { courseId: routeCourseId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(routeCourseId ? Number(routeCourseId) : '');
  const [questions, setQuestions] = useState([]);
  const [quizDuration, setQuizDuration] = useState('');

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingDuration, setSavingDuration] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);

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
    setLoadingCourses(true);
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

  // 2. Tải câu hỏi và thời gian làm bài của khóa học được chọn
  const loadQuestions = useCallback(async (cid) => {
    if (!cid) return;
    setLoadingQuestions(true);
    setError('');
    try {
      const res = await getCourseQuestions(cid);
      const list = res?.data?.questions || [];
      setQuestions(list.map(applySavedOptionOrder));
      const dur = res?.data?.course?.quizDuration;
      setQuizDuration(dur != null ? String(dur) : '');
    } catch (err) {
      setError(parseApiError(err).message);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      setEditingId(null);
      setFormData(EMPTY_FORM);
      loadQuestions(selectedCourseId);
    }
  }, [selectedCourseId, loadQuestions]);

  useEffect(() => {
    if (mustChangePassword) {
      setNotice('');
      setError('Tài khoản đang chờ xử lý. Hãy đổi mật khẩu tạm trong Hồ sơ trước khi quản lý câu hỏi.');
    }
  }, [mustChangePassword]);

  // 3. Lưu thời gian làm bài (phút)
  const handleSaveDuration = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setError('');
    setNotice('');
    setSavingDuration(true);
    try {
      await updateCourseQuizDuration(selectedCourseId, Number(quizDuration));
      setNotice('Đã lưu thời gian làm bài trắc nghiệm.');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSavingDuration(false);
    }
  };

  // 4. Thêm mới hoặc cập nhật câu hỏi
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setError('');
    setNotice('');
    setSavingQuestion(true);
    try {
      if (editingId) {
        await updateCourseQuestion(selectedCourseId, editingId, formData);
        saveQuestionOptionOrder(editingId, formData.options, formData.correctIndex);
        setNotice('Cập nhật câu hỏi thành công!');
      } else {
        const res = await createCourseQuestion(selectedCourseId, formData);
        if (res?.data?.id) {
          saveQuestionOptionOrder(res.data.id, formData.options, formData.correctIndex);
        }
        setNotice('Thêm câu hỏi mới thành công!');
      }
      setEditingId(null);
      setFormData(EMPTY_FORM);
      await loadQuestions(selectedCourseId);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleEditClick = (q) => {
    setError('');
    setNotice('');
    setEditingId(q.id);
    setFormData({
      content: q.content,
      options: [...q.options],
      correctIndex: q.correctIndex ?? 0,
    });
  };

  const handleDeleteClick = async (questionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này không?')) return;
    setError('');
    setNotice('');
    try {
      await deleteCourseQuestion(selectedCourseId, questionId);
      try {
        localStorage.removeItem(`${OPTION_ORDER_PREFIX}${questionId}`);
      } catch {
        // Bỏ qua lỗi bộ nhớ
      }
      if (editingId === questionId) {
        setEditingId(null);
        setFormData(EMPTY_FORM);
      }
      setNotice('Đã xóa câu hỏi.');
      await loadQuestions(selectedCourseId);
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const updateOptionText = (index, value) => {
    setFormData((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[index] = value;
      return { ...prev, options: nextOptions };
    });
  };

  if (loadingCourses) return <Loading />;

  return (
    <>
      <PageHeader
        title="Quản lý câu hỏi trắc nghiệm"
        subtitle="Thiết lập thời gian làm bài và ngân hàng câu hỏi 4 lựa chọn cho khóa học của bạn."
      />

      {error && <ErrorMessage message={error} />}
      {notice && <Alert variant="success">{notice}</Alert>}

      {courses.length === 0 ? (
        <Alert variant="info">Bạn chưa có khóa học nào để soạn câu hỏi trắc nghiệm.</Alert>
      ) : (
        <>
          {/* Thanh chọn khóa học & cài đặt thời gian làm bài */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={6}>
                  <Form.Group controlId="teacherCourseSelect">
                    <Form.Label className="fw-semibold">Chọn khóa học của bạn</Form.Label>
                   <Dropdown
                     className="w-100"
                     onSelect={(value) => setSelectedCourseId(Number(value))}
                   >
                     <Dropdown.Toggle
                       id="teacher-course-dropdown"
                       variant="outline-secondary"
                       className="w-100 text-start d-flex justify-content-between align-items-center"
                     >
                       {courses.find((c) => c.id === selectedCourseId)?.title || 'Chọn khóa học'}
                     </Dropdown.Toggle>
                     <Dropdown.Menu
                       className="w-100"
                       style={{ maxHeight: '240px', overflowY: 'auto' }}
                     >
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
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form onSubmit={handleSaveDuration} className="d-flex gap-2 align-items-end">
                    <Form.Group controlId="quizDurationInput" className="flex-grow-1">
                      <Form.Label className="fw-semibold">Thời gian làm bài (phút)</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={300}
                        placeholder="Ví dụ: 30"
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="outline-primary" disabled={savingDuration}>
                      {savingDuration ? 'Đang lưu...' : 'Lưu thời gian'}
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4">
            {/* Cột trái: Form thêm / sửa câu hỏi */}
            <Col lg={5}>
              <Card>
                <Card.Header className="fw-semibold">
                  {editingId ? `Sửa câu hỏi #${editingId}` : 'Thêm câu hỏi mới'}
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmitQuestion}>
                    <Form.Group className="mb-3" controlId="questionContent">
                      <Form.Label>Nội dung câu hỏi</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Nhập nội dung câu hỏi..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Form.Label className="d-block mb-2">
                      4 lựa chọn (tick chọn 1 đáp án đúng)
                    </Form.Label>
                    {LETTERS.map((letter, idx) => (
                      <div key={letter} className="d-flex align-items-center gap-2 mb-2">
                        <Form.Check
                          type="radio"
                          name="correctOption"
                          id={`opt-radio-${idx}`}
                          checked={formData.correctIndex === idx}
                          onChange={() => setFormData({ ...formData, correctIndex: idx })}
                          title="Đánh dấu là đáp án đúng"
                        />
                        <Badge bg={formData.correctIndex === idx ? 'success' : 'secondary'}>
                          {letter}
                        </Badge>
                        <Form.Control
                          type="text"
                          placeholder={`Đáp án ${letter}`}
                          value={formData.options[idx]}
                          onChange={(e) => updateOptionText(idx, e.target.value)}
                          required
                        />
                      </div>
                    ))}

                    <div className="d-flex gap-2 mt-3">
                      <Button type="submit" variant="primary" disabled={savingQuestion}>
                        {savingQuestion
                          ? 'Đang lưu...'
                          : editingId
                          ? 'Cập nhật câu hỏi'
                          : 'Thêm câu hỏi'}
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => {
                            setEditingId(null);
                            setFormData(EMPTY_FORM);
                          }}
                        >
                          Hủy sửa
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Cột phải: Danh sách câu hỏi hiện có */}
            <Col lg={7}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Danh sách câu hỏi ({questions.length} câu)</span>
                  {quizDuration && <Badge bg="info">Thời gian thi: {quizDuration} phút</Badge>}
                </Card.Header>
                {loadingQuestions ? (
                  <Card.Body>
                    <Loading />
                  </Card.Body>
                ) : questions.length === 0 ? (
                  <Card.Body className="text-muted text-center py-4">
                    Khóa học này chưa có câu hỏi trắc nghiệm nào.
                  </Card.Body>
                ) : (
                  <ListGroup variant="flush">
                    {questions.map((q, index) => (
                      <ListGroup.Item key={q.id}>
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div>
                            <strong>Câu {index + 1}:</strong> {q.content}
                          </div>
                          <div className="d-flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEditClick(q)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteClick(q.id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                        <ul className="list-unstyled mb-0 small">
                          {q.options.map((opt, optIdx) => (
                            <li
                              key={optIdx}
                              className={
                                optIdx === q.correctIndex ? 'text-success fw-semibold' : 'text-muted'
                              }
                            >
                              {LETTERS[optIdx]}. {opt} {optIdx === q.correctIndex && '✓ (Đáp án đúng)'}
                            </li>
                          ))}
                        </ul>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default TeacherQuestionsPage;