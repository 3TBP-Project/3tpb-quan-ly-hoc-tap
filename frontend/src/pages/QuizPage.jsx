// AI-assisted [AI-06]
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { startQuizApi, submitQuizApi } from '../services/quizApi';
import QuizTimer from '../components/quiz/QuizTimer';
import QuizResultView from '../components/quiz/QuizResultView';
import './QuizPage.css';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('intro'); // 'intro' | 'taking' | 'result'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dữ liệu lượt thi nhận từ POST /api/quizzes/courses/:courseId/start
  const [attemptData, setAttemptData] = useState(null);
  // Map đáp án đã chọn: { [questionId]: "Nội dung đáp án" }
  const [answers, setAnswers] = useState({});
  // Dữ liệu kết quả nhận từ POST /api/quizzes/attempts/:attemptId/submit
  const [resultData, setResultData] = useState(null);

  // Hộp thoại xác nhận nộp bài khi còn câu chưa chọn (thay cho window.confirm)
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSubmittingRef = useRef(false);

  const handleStartQuiz = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const data = await startQuizApi(courseId);
      setAttemptData(data);
      setAnswers({});
      setResultData(null);
      setStep('taking');
    } catch (err) {
      setErrorMessage(err.message || 'Không thể khởi tạo bài kiểm tra.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionValue) => {
    if (submitting) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const executeSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!attemptData?.attemptId || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setSubmitting(true);
      setErrorMessage('');

      try {
        const result = await submitQuizApi(attemptData.attemptId, answers);
        setResultData(result);
        setStep('result');
      } catch (err) {
        const prefix = isAutoSubmit ? 'Hết giờ làm bài: ' : '';
        setErrorMessage(`${prefix}${err.message || 'Nộp bài thất bại.'}`);
      } finally {
        isSubmittingRef.current = false;
        setSubmitting(false);
      }
    },
    [attemptData, answers]
  );

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!attemptData) return;

    const totalQuestions = attemptData.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      setConfirmOpen(true);
      return;
    }

    executeSubmit(false);
  };

  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    executeSubmit(false);
  };

  const handleTimeUp = useCallback(() => {
    // Hết giờ thì nộp luôn, đóng hộp thoại xác nhận nếu đang mở
    setConfirmOpen(false);
    executeSubmit(true);
  }, [executeSubmit]);

  const handleBackToCourse = () => {
    navigate('/');
  };

  const scrollToQuestion = (questionId) => {
    const el = document.getElementById(`question-card-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const questions = attemptData?.questions || [];
  const answeredCount = Object.keys(answers).length;
  // Số thứ tự các câu chưa chọn, để học viên bấm quay lại làm tiếp
  const unansweredQuestions = questions
    .map((q, index) => ({ id: q.id, number: index + 1 }))
    .filter((q) => !answers[q.id]);

  const handleGoToQuestion = (questionId) => {
    setConfirmOpen(false);
    // Đợi hộp thoại đóng rồi mới cuộn tới câu hỏi
    setTimeout(() => scrollToQuestion(questionId), 200);
  };

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        {errorMessage && (
          <div className="quiz-alert quiz-alert--error" role="alert">
            <strong>Thông báo:</strong> {errorMessage}
          </div>
        )}

        {/* GIAI ĐOẠN 1: MÀN HÌNH XÁC NHẬN BẮT ĐẦU LÀM BÀI */}
        {step === 'intro' && (
          <div className="quiz-intro-card">
            <h1 className="quiz-intro-card__title">Bài kiểm tra trắc nghiệm khóa học</h1>
            <p className="quiz-intro-card__desc">
              Hệ thống sẽ bắt đầu tính giờ ngay khi bạn nhấn nút làm bài. Vui lòng đọc kỹ các quy định sau:
            </p>
            <ul className="quiz-intro-card__rules">
              <li>Hình thức: Câu hỏi trắc nghiệm 4 lựa chọn (1 đáp án đúng).</li>
              <li>Số lượt làm bài tối đa: <strong>3 lượt / khóa học</strong>, hệ thống ghi nhận điểm cao nhất.</li>
              <li>Chấm điểm tự động theo <strong>thang điểm 10</strong> ngay sau khi nộp bài hợp lệ.</li>
              <li>Thời hạn nộp bài được kiểm soát trực tiếp trên máy chủ; bài nộp sau hạn sẽ bị từ chối.</li>
            </ul>

            <div className="quiz-intro-card__actions">
              <button
                type="button"
                className="quiz-btn quiz-btn--primary"
                onClick={handleStartQuiz}
                disabled={loading}
              >
                {loading ? 'Đang tải đề thi...' : 'Bắt đầu làm bài'}
              </button>
              <button
                type="button"
                className="quiz-btn quiz-btn--secondary"
                onClick={handleBackToCourse}
                disabled={loading}
              >
                Quay lại danh sách khóa học
              </button>
            </div>
          </div>
        )}

        {/* GIAI ĐOẠN 2: TRANG LÀM BÀI TRẮC NGHIỆM */}
        {step === 'taking' && attemptData && (
          <form className="quiz-taking" onSubmit={handleManualSubmit}>
            {/* Thanh trạng thái dính trên cùng: Tên khóa, lượt thi, đồng hồ, nút nộp */}
            <header className="quiz-topbar">
              <div className="quiz-topbar__info">
                <h1 className="quiz-topbar__title">{attemptData.courseTitle}</h1>
                <div className="quiz-topbar__meta">
                  <span>
                    Lượt thi: <strong>{attemptData.attemptNumber} / 3</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Đã làm: <strong>{answeredCount}/{questions.length}</strong> câu
                  </span>
                </div>
              </div>

              <div className="quiz-topbar__controls">
                <QuizTimer
                  startedAt={attemptData.startedAt}
                  quizDurationMinutes={attemptData.quizDuration}
                  disabled={submitting}
                  onTimeUp={handleTimeUp}
                />
                <button
                  type="submit"
                  className="quiz-btn quiz-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
                </button>
              </div>
            </header>

            <div className="quiz-layout">
              {/* Danh sách câu hỏi bên trái */}
              <div className="quiz-questions-column">
                {questions.map((question, qIndex) => {
                  const selectedValue = answers[question.id] || '';
                  return (
                    <section
                      key={question.id}
                      id={`question-card-${question.id}`}
                      className="quiz-question-card"
                    >
                      <div className="quiz-question-card__header">
                        <span className="quiz-question-card__index">Câu {qIndex + 1}</span>
                        {selectedValue && (
                          <span className="quiz-question-card__answered-tag">Đã chọn</span>
                        )}
                      </div>

                      <p className="quiz-question-card__content">{question.content}</p>

                      <div className="quiz-options-list" role="radiogroup" aria-label={`Câu hỏi ${qIndex + 1}`}>
                        {(question.options || []).map((optionText, optIndex) => {
                          const isChecked = selectedValue === optionText;
                          const inputId = `q-${question.id}-opt-${optIndex}`;
                          return (
                            <label
                              key={inputId}
                              htmlFor={inputId}
                              className={`quiz-option ${isChecked ? 'quiz-option--selected' : ''}`}
                            >
                              <input
                                id={inputId}
                                type="radio"
                                name={`question-${question.id}`}
                                value={optionText}
                                checked={isChecked}
                                onChange={() => handleSelectOption(question.id, optionText)}
                                disabled={submitting}
                              />
                              <span className="quiz-option__letter">
                                {OPTION_LETTERS[optIndex] || optIndex + 1}.
                              </span>
                              <span className="quiz-option__text">{optionText}</span>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                <div className="quiz-bottom-submit">
                  <button
                    type="submit"
                    className="quiz-btn quiz-btn--primary quiz-btn--lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang chấm điểm...' : 'Hoàn thành & Nộp bài'}
                  </button>
                </div>
              </div>

              {/* Bảng điều hướng câu hỏi bên phải */}
              <aside className="quiz-sidebar">
                <div className="quiz-nav-card">
                  <h2 className="quiz-nav-card__title">Danh sách câu hỏi</h2>
                  <div className="quiz-nav-grid">
                    {questions.map((q, idx) => {
                      const isDone = Boolean(answers[q.id]);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          className={`quiz-nav-btn ${isDone ? 'quiz-nav-btn--done' : ''}`}
                          onClick={() => scrollToQuestion(q.id)}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className="quiz-nav-legend">
                    <span>
                      <i className="legend-dot legend-dot--done" /> Đã chọn ({answeredCount})
                    </span>
                    <span>
                      <i className="legend-dot" /> Chưa chọn ({questions.length - answeredCount})
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        )}

        <Modal
          show={confirmOpen && step === 'taking'}
          onHide={() => setConfirmOpen(false)}
          centered
          className="quiz-confirm-modal"
          aria-labelledby="quiz-confirm-title"
        >
          <Modal.Body>
            <div className="quiz-confirm__icon" aria-hidden="true">!</div>
            <h2 id="quiz-confirm-title" className="quiz-confirm__title">Bạn chưa làm hết bài</h2>
            <p className="quiz-confirm__text">
              Bạn còn <strong>{unansweredQuestions.length}</strong> câu chưa chọn đáp án.
              Câu bỏ trống sẽ không được tính điểm. Bạn có chắc chắn muốn nộp bài ngay bây giờ không?
            </p>
            {unansweredQuestions.length > 0 && (
              <div className="quiz-confirm__list">
                <span className="quiz-confirm__list-label">Câu chưa làm (bấm để quay lại):</span>
                <div className="quiz-confirm__chips">
                  {unansweredQuestions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      className="quiz-confirm__chip"
                      onClick={() => handleGoToQuestion(q.id)}
                    >
                      {q.number}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="quiz-confirm__actions">
              <button
                type="button"
                className="quiz-btn quiz-btn--secondary"
                onClick={() => setConfirmOpen(false)}
                autoFocus
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                className="quiz-btn quiz-btn--primary"
                onClick={handleConfirmSubmit}
                disabled={submitting}
              >
                Nộp bài
              </button>
            </div>
          </Modal.Body>
        </Modal>

        {/* GIAI ĐOẠN 3: TRANG KẾT QUẢ */}
        {step === 'result' && resultData && (
          <QuizResultView
            courseTitle={attemptData?.courseTitle}
            result={resultData}
            remainingAttempts={attemptData?.remainingAttempts ?? 0}
            maxAttempts={3}
            onRetry={handleStartQuiz}
            onBackToCourse={handleBackToCourse}
            retrying={loading}
          />
        )}
      </div>
    </div>
  );
}