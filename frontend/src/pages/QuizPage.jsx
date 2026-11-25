// AI-assisted [AI-06] [AI-25]
import { useCallback, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { startQuizApi, submitQuizApi } from '../services/quizApi';
import { getCourseById } from '../services/courseService';
import { getQuizHistory } from '../services/profileService';
import { useFetch } from '../hooks/useFetch';
import QuizTimer from '../components/quiz/QuizTimer';
import QuizResultView from '../components/quiz/QuizResultView';
import './QuizPage.css';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const MAX_ATTEMPTS = 3;

const formatScore = (value) => Number(value).toFixed(2).replace(/\.?0+$/, '');

// Lỗi máy chủ từ chối bài (quá giờ, hết lượt...) khác lỗi mạng: không nên bấm "Thử lại"
const isRejected = (status) => status >= 400 && status < 500;

// Giao diện theo Figma "HT-06 · Giới thiệu bài kiểm tra", "HT-06 · Làm bài · Câu hỏi",
// "HT-06 · Xác nhận nộp bài (đã làm hết / còn câu chưa làm / đang nộp / lỗi / hết giờ)", "HT-06 · Kết quả".
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

  // Giao diện làm bài: câu đang xem, hộp xác nhận nộp, lỗi nộp, nộp tự động khi hết giờ
  const [current, setCurrent] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null); // { message, status }
  const [timeUp, setTimeUp] = useState(false);
  // Điểm cao nhất trước lượt đang làm, để biết lượt này có lập điểm cao mới không
  const [bestBefore, setBestBefore] = useState(null);

  const isSubmittingRef = useRef(false);
  const questionHeadingRef = useRef(null);

  // Màn giới thiệu: tên khóa học + số lượt đã làm, điểm cao nhất (lịch sử làm bài của học viên)
  const courseReq = useFetch(getCourseById, { id: courseId });
  const historyReq = useFetch(getQuizHistory);
  const history = Array.isArray(historyReq.data)
    ? historyReq.data.find((c) => String(c.courseId) === String(courseId))
    : null;
  const usedAttempts = history?.attempts?.length ?? 0;
  const historyBest = history ? Number(history.bestScore) : null;
  const courseTitle = attemptData?.courseTitle || courseReq.data?.title || history?.courseTitle || '';
  const outOfAttempts = Boolean(history) && usedAttempts >= MAX_ATTEMPTS && !resultData;

  const handleStartQuiz = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const data = await startQuizApi(courseId);
      setBestBefore(resultData ? Number(resultData.bestScore) : historyBest);
      setAttemptData(data);
      setAnswers({});
      setResultData(null);
      setCurrent(0);
      setSubmitError(null);
      setTimeUp(false);
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
      setSubmitError(null);

      try {
        const result = await submitQuizApi(attemptData.attemptId, answers);
        setResultData(result);
        setConfirmOpen(false);
        setTimeUp(false);
        setStep('result');
        window.scrollTo({ top: 0 });
      } catch (err) {
        const prefix = isAutoSubmit ? 'Hết giờ làm bài: ' : '';
        // Không có mã HTTP = lỗi mạng (fetch báo "Failed to fetch"): thay bằng câu dễ hiểu
        const message = err.statusCode
          ? err.message || 'Nộp bài thất bại.'
          : 'Không nộp được bài. Kiểm tra kết nối mạng rồi thử lại.';
        setSubmitError({ message: `${prefix}${message}`, status: err.statusCode ?? 0 });
        setConfirmOpen(true);
        setTimeUp(false);
      } finally {
        isSubmittingRef.current = false;
        setSubmitting(false);
      }
    },
    [attemptData, answers]
  );

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    setConfirmOpen(false);
    executeSubmit(true);
  }, [executeSubmit]);

  const handleBackToCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  const questions = attemptData?.questions || [];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const unanswered = questions
    .map((q, index) => ({ id: q.id, index }))
    .filter(({ id }) => !answers[id]);

  const goTo = (index) => {
    setCurrent(Math.max(0, Math.min(index, questions.length - 1)));
    // Đưa tiêu điểm về câu hỏi mới để trình đọc màn hình đọc ngay
    requestAnimationFrame(() => questionHeadingRef.current?.focus());
  };

  const openConfirm = () => {
    setSubmitError(null);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setConfirmOpen(false);
  };

  // ---------- 1. Giới thiệu ----------
  if (step === 'intro') {
    return (
      <div className="ht-quiz-page">
        <section className="ht-quiz-intro" aria-labelledby="ht-quiz-intro-title">
          <span className="ht-quiz-intro__icon" aria-hidden="true">?</span>
          <h1 id="ht-quiz-intro-title" className="ht-quiz-intro__title">Bài kiểm tra cuối khóa</h1>
          <p className="ht-quiz-intro__desc">
            {courseTitle ? `${courseTitle} · ` : ''}Kiểm tra lại kiến thức của cả khóa học bằng câu hỏi trắc nghiệm.
          </p>

          <dl className="ht-quiz-stats">
            <div className="ht-quiz-stat">
              <dt>Hình thức</dt>
              <dd>Trắc nghiệm 4 lựa chọn</dd>
            </div>
            <div className="ht-quiz-stat">
              <dt>Chấm điểm</dt>
              <dd>Tự động · thang 10</dd>
            </div>
            <div className="ht-quiz-stat">
              <dt>Lượt làm còn lại</dt>
              <dd>{historyReq.loading && !historyReq.data ? '…' : `${Math.max(0, MAX_ATTEMPTS - usedAttempts)} / ${MAX_ATTEMPTS} lần`}</dd>
            </div>
            <div className="ht-quiz-stat">
              <dt>Điểm cao nhất</dt>
              <dd>{historyBest == null ? 'Chưa có' : `${formatScore(historyBest)} / 10`}</dd>
            </div>
          </dl>

          {errorMessage && (
            <p className="ht-quiz-note is-error" role="alert">
              <span className="ht-quiz-note__icon" aria-hidden="true">✕</span>
              <span>{errorMessage}</span>
            </p>
          )}

          {outOfAttempts ? (
            <div className="ht-quiz-note is-info">
              <span className="ht-quiz-note__icon" aria-hidden="true">i</span>
              <span>
                <strong>Bạn đã dùng hết {MAX_ATTEMPTS}/{MAX_ATTEMPTS} lượt làm bài</strong>
                Xem lại kết quả và đáp án các lượt trước trong Hồ sơ.
              </span>
            </div>
          ) : (
            <div className="ht-quiz-note is-warning">
              <span className="ht-quiz-note__icon" aria-hidden="true">!</span>
              <span>
                <strong>Đồng hồ chạy ngay khi bắt đầu</strong>
                Bài sẽ tự nộp khi hết giờ. Mỗi lần làm được tính một lượt, hệ thống giữ điểm cao nhất.
              </span>
            </div>
          )}

          <div className="ht-quiz-actions">
            {outOfAttempts ? (
              <Link to="/profile?tab=history" className="ht-btn ht-btn--primary">
                Xem kết quả các lượt trước
              </Link>
            ) : (
              <button type="button" className="ht-btn ht-btn--primary" onClick={handleStartQuiz} disabled={loading}>
                {loading ? 'Đang tải đề thi...' : 'Bắt đầu làm bài'}
              </button>
            )}
            <button type="button" className="ht-btn ht-btn--ghost" onClick={handleBackToCourse} disabled={loading}>
              Quay lại khóa học
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ---------- 3. Kết quả ----------
  if (step === 'result' && resultData) {
    return (
      <div className="ht-quiz-page">
        <QuizResultView
          courseTitle={courseTitle}
          result={resultData}
          questions={questions}
          startedAt={attemptData?.startedAt}
          attemptNumber={attemptData?.attemptNumber ?? 0}
          remainingAttempts={attemptData?.remainingAttempts ?? 0}
          maxAttempts={MAX_ATTEMPTS}
          bestBefore={bestBefore}
          onRetry={handleStartQuiz}
          onBackToCourse={handleBackToCourse}
          retrying={loading}
          retryError={errorMessage}
        />
      </div>
    );
  }

  // ---------- 2. Làm bài ----------
  if (!attemptData) return null;
  const question = questions[current];
  const selectedValue = question ? answers[question.id] || '' : '';
  const rejected = submitError && isRejected(submitError.status);

  const timeChip = (
    <QuizTimer
      variant="chip"
      startedAt={attemptData.startedAt}
      quizDurationMinutes={attemptData.quizDuration}
      disabled={false}
    />
  );
  const chips = (
    <div className="ht-quiz-chips">
      <span className="ht-quiz-chip">
        {answeredCount === questions.length ? '✓ ' : ''}Đã trả lời {answeredCount}/{questions.length} câu
      </span>
      <span className="ht-quiz-chip">{timeChip}</span>
      <span className="ht-quiz-chip">Lượt {attemptData.attemptNumber}/{MAX_ATTEMPTS}</span>
    </div>
  );

  return (
    <div className="ht-quiz-page ht-quiz-page--taking">
      {/* Thanh bài kiểm tra tràn ngang dưới Header: tên bài + đồng hồ */}
      <div className="ht-quiz-bar">
        <p className="ht-quiz-bar__title">
          <span className="ht-quiz-bar__label">Bài kiểm tra cuối khóa</span>
          <span className="ht-quiz-bar__course"> · {courseTitle}</span>
        </p>
        <QuizTimer
          startedAt={attemptData.startedAt}
          quizDurationMinutes={attemptData.quizDuration}
          disabled={submitting}
          onTimeUp={handleTimeUp}
        />
      </div>

      <div className="ht-quiz-body">
        {question && (
          <section className="ht-quiz-card" aria-labelledby="ht-quiz-question">
            <p className="ht-quiz-card__meta">
              Câu {current + 1} / {questions.length} · Chọn một đáp án
            </p>
            <h1 id="ht-quiz-question" className="ht-quiz-card__question" tabIndex={-1} ref={questionHeadingRef}>
              {question.content}
            </h1>

            <div className="ht-quiz-options" role="radiogroup" aria-labelledby="ht-quiz-question">
              {(question.options || []).map((optionText, optIndex) => {
                const isChecked = selectedValue === optionText;
                const inputId = `q-${question.id}-opt-${optIndex}`;
                return (
                  <label key={inputId} htmlFor={inputId} className={`ht-quiz-option${isChecked ? ' is-selected' : ''}`}>
                    <input
                      id={inputId}
                      type="radio"
                      className="ht-quiz-visually-hidden"
                      name={`question-${question.id}`}
                      value={optionText}
                      checked={isChecked}
                      onChange={() => handleSelectOption(question.id, optionText)}
                      disabled={submitting}
                    />
                    <span className="ht-quiz-option__letter" aria-hidden="true">
                      {OPTION_LETTERS[optIndex] || optIndex + 1}
                    </span>
                    <span className="ht-quiz-option__text">{optionText}</span>
                    {isChecked && <span className="visually-hidden"> (đã chọn)</span>}
                  </label>
                );
              })}
            </div>

            <div className="ht-quiz-card__nav">
              <button type="button" className="ht-btn ht-btn--secondary" onClick={() => goTo(current - 1)} disabled={current === 0}>
                ‹ Câu trước
              </button>
              {current < questions.length - 1 ? (
                <button type="button" className="ht-btn ht-btn--primary" onClick={() => goTo(current + 1)}>
                  Câu tiếp ›
                </button>
              ) : (
                <button type="button" className="ht-btn ht-btn--primary" onClick={openConfirm} disabled={submitting}>
                  Nộp bài
                </button>
              )}
            </div>
          </section>
        )}

        {/* Bảng câu hỏi: ô tím nhạt = đã trả lời, tím đậm = đang làm, viền = chưa làm */}
        <aside className="ht-quiz-nav" aria-labelledby="ht-quiz-nav-title">
          <h2 id="ht-quiz-nav-title" className="ht-quiz-nav__title">Danh sách câu hỏi</h2>
          <ol className="ht-quiz-grid">
            {questions.map((q, idx) => {
              const done = Boolean(answers[q.id]);
              const isCurrent = idx === current;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    className={`ht-quiz-cell${done ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}
                    onClick={() => goTo(idx)}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Câu ${idx + 1}${done ? ', đã trả lời' : ', chưa trả lời'}`}
                  >
                    {idx + 1}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="ht-quiz-nav__legend">
            Đã trả lời {answeredCount}/{questions.length} · Ô tím đậm là câu đang làm, ô viền là câu chưa làm
          </p>
          <button type="button" className="ht-btn ht-btn--primary ht-quiz-nav__submit" onClick={openConfirm} disabled={submitting}>
            Nộp bài
          </button>
        </aside>
      </div>

      {/* Hộp xác nhận nộp bài (đủ / thiếu câu / đang nộp / lỗi) */}
      <Modal
        show={confirmOpen && !timeUp}
        onHide={closeConfirm}
        centered
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
        dialogClassName="ht-quiz-modal-dialog"
        contentClassName="ht-quiz-modal"
        aria-labelledby="ht-quiz-confirm-title"
      >
        <h2 id="ht-quiz-confirm-title" className="ht-quiz-modal__title">
          {rejected ? 'Không thể chấm bài này' : 'Nộp bài kiểm tra?'}
        </h2>
        {chips}

        {submitError ? (
          <p className="ht-quiz-note is-error" role="alert">
            <span className="ht-quiz-note__icon" aria-hidden="true">✕</span>
            <span>{submitError.message}</span>
          </p>
        ) : (
          unanswered.length > 0 && (
            <div className="ht-quiz-note is-warning">
              <span className="ht-quiz-note__icon" aria-hidden="true">!</span>
              <span>
                <strong>Còn {unanswered.length} câu chưa chọn đáp án</strong>
                <span className="ht-quiz-jumps">
                  {unanswered.map(({ id, index }) => (
                    <button
                      key={id}
                      type="button"
                      className="ht-quiz-jump"
                      onClick={() => {
                        setConfirmOpen(false);
                        goTo(index);
                      }}
                    >
                      Câu {index + 1} ›
                    </button>
                  ))}
                </span>
              </span>
            </div>
          )
        )}

        <p className="ht-quiz-modal__text">
          {rejected
            ? 'Bạn vẫn có thể xem lại kết quả của các lượt trước.'
            : submitError
              ? 'Bài làm của bạn vẫn được giữ nguyên. Hãy thử lại khi có mạng.'
              : 'Sau khi nộp, bạn không thể sửa đáp án. Bài sẽ được chấm ngay.'}
        </p>

        <div className="ht-quiz-modal__actions">
          {rejected ? (
            <Link to="/profile?tab=history" className="ht-btn ht-btn--primary">
              Xem kết quả các lượt trước
            </Link>
          ) : (
            <>
              <button
                type="button"
                className="ht-btn ht-btn--secondary"
                disabled={submitting}
                onClick={() => {
                  setConfirmOpen(false);
                  if (!submitError && unanswered.length > 0) goTo(unanswered[0].index);
                }}
              >
                {submitError ? 'Tiếp tục làm bài' : unanswered.length > 0 ? 'Xem lại câu chưa làm' : 'Làm tiếp'}
              </button>
              <button type="button" className="ht-btn ht-btn--primary" disabled={submitting} onClick={() => executeSubmit(false)}>
                {submitting ? 'Đang nộp bài...' : submitError ? 'Thử lại' : unanswered.length > 0 ? 'Vẫn nộp bài' : 'Nộp bài'}
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Hết giờ: tự nộp, không cho đóng (Figma "Xác nhận nộp bài (hết giờ)") */}
      <Modal
        show={timeUp}
        centered
        backdrop="static"
        keyboard={false}
        dialogClassName="ht-quiz-modal-dialog ht-quiz-modal-dialog--sm"
        contentClassName="ht-quiz-modal ht-quiz-modal--center"
        aria-labelledby="ht-quiz-timeup-title"
      >
        <span className="ht-quiz-modal__clock" aria-hidden="true">⏱</span>
        <h2 id="ht-quiz-timeup-title" className="ht-quiz-modal__title">Đã hết giờ làm bài</h2>
        {chips}
        <p className="ht-quiz-modal__text" role="status">Bài làm đang được nộp tự động...</p>
        <div className="ht-quiz-progress" aria-hidden="true"><span /></div>
        <p className="ht-quiz-modal__hint">Đang chuyển đến trang kết quả...</p>
      </Modal>
    </div>
  );
}
