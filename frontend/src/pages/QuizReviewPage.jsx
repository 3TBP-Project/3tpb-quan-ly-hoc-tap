// HT-07: Xem lai bai lam cu
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import NotFoundPage from './NotFoundPage';
import { useFetch } from '../hooks/useFetch';
import { getAttemptReview } from '../services/profileService';
import './QuizReviewPage.css';

const FILTERS = [
  { key: 'all', label: 'Tất cả', mark: '•' },
  { key: 'wrong', label: 'Sai', mark: '✕' },
  { key: 'unanswered', label: 'Bỏ trống', mark: '—' },
  { key: 'correct', label: 'Đúng', mark: '✓' },
];

const formatScore = (score) => Number(score).toFixed(1);
const scoreClass = (score) => (score >= 8 ? 'high' : score >= 5 ? 'mid' : 'low');
const questionState = (q) => (q.isCorrect ? 'correct' : q.isAnswered ? 'wrong' : 'unanswered');
const STATE_LABEL = { correct: 'Dung', wrong: 'Sai', unanswered: 'Bo trong' };

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function QuestionCard({ question }) {
  const state = questionState(question);
  return (
    <article id={`qr-question-${question.number}`} className={`qr-question ${state}`}>
      <header className="qr-question-head">
        <span className="qr-question-number">Cau {question.number}</span>
        <span className={`qr-pill ${state}`}>{STATE_LABEL[state]}</span>
      </header>
      <p className="qr-question-content">{question.content}</p>
      {question.options.length > 0 ? (
        <ol className="qr-options">
          {question.options.map((option) => {
            const isSelected = option.label === question.selectedLabel;
            const isCorrect = option.label === question.correctLabel;
            return (
              <li key={option.label} className={`qr-option ${isCorrect ? 'is-correct' : ''} ${isSelected && !isCorrect ? 'is-wrong' : ''}`}>
                <span className="qr-option-label">{option.label}.</span>
                <span className="qr-option-text">{option.text}</span>
                {isSelected && !isCorrect && <span className="qr-option-tag wrong">✕ Bạn chọn</span>}
                {isSelected && isCorrect && <span className="qr-option-tag correct">✓ Bạn chọn · Đáp án đúng</span>}
                {isCorrect && !isSelected && <span className="qr-option-tag correct">✓ Đáp án đúng</span>}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="qr-muted">Khong con du lieu cac lua chon cua cau nay.</p>
      )}
      <footer className="qr-answer-bar">
        <span className="qr-answer-key">✓ Đáp án đúng: <b>{question.correctLabel ?? question.correctAnswer}</b></span>
        {question.options.length > 0 && (
          <span className="qr-bubbles">
            {question.options.map((option) => {
              const selected = option.label === question.selectedLabel;
              const correct = option.label === question.correctLabel;
              return (
                <span key={option.label} className={`qr-bubble ${selected ? (question.isCorrect ? 'chosen-correct' : 'chosen-wrong') : ''} ${correct ? 'key' : ''}`}>
                  {option.label}
                </span>
              );
            })}
          </span>
        )}
      </footer>
    </article>
  );
}

function QuizReviewPage() {
  const { attemptId } = useParams();
  const { data, loading, error, status } = useFetch(getAttemptReview, { attemptId });
  const [filter, setFilter] = useState('all');

  if (loading && !data) return <Loading />;
  if (status === 404) return <NotFoundPage />;
  if (error) {
    return (
      <div className="quiz-review-page">
        <Link to="/profile" state={{ tab: 'history' }} className="qr-back">← Lịch sử làm bài</Link>
        <ErrorMessage message={error} />
      </div>
    );
  }
  if (!data) return <Loading />;

  const questions = data.questions ?? [];
  const visible = filter === 'all' ? questions : questions.filter((q) => questionState(q) === filter);
  const counts = {
    all: questions.length,
    correct: data.correctCount,
    wrong: data.wrongCount,
    unanswered: data.unansweredCount,
  };

  const jumpTo = (number) => {
    setFilter('all');
    requestAnimationFrame(() => {
      document.getElementById(`qr-question-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="quiz-review-page">
      <Link to="/profile" state={{ tab: 'history' }} className="qr-back">← Lịch sử làm bài</Link>
      <h1 className="qr-title">Xem lại bài làm</h1>
      <p className="qr-sub">{data.courseTitle} · Lần {data.attemptNumber}/{data.maxAttempts}</p>

      <div className="qr-layout">
        <aside className="qr-side">
          <section className="qr-card qr-summary">
            <div className={`qr-score ${scoreClass(data.score)}`}>
              <b>{formatScore(data.score)}</b>
              <span>/ 10 điểm</span>
            </div>
            {data.hasDetails && (
              <p className="qr-score-why">
                Đúng {data.correctCount}/{data.totalQuestions} câu
              </p>
            )}
            <dl className="qr-stats">
              {data.hasDetails && (
                <>
                  <div><dt className="correct">Đúng</dt><dd>{data.correctCount}</dd></div>
                  <div><dt className="wrong">Sai</dt><dd>{data.wrongCount}</dd></div>
                  <div><dt className="unanswered">Bỏ trống</dt><dd>{data.unansweredCount}</dd></div>
                </>
              )}
              <div><dt>Thời gian làm</dt><dd>{data.durationMinutes ? `${data.durationMinutes} phút` : '-'}</dd></div>
              <div><dt>Thời điểm nộp</dt><dd>{formatDateTime(data.submittedAt)}</dd></div>
            </dl>
          </section>

          {data.hasDetails && (
            <section className="qr-card">
              <h2 className="qr-card-title">Bảng câu hỏi</h2>
              <div className="qr-grid">
                {questions.map((q) => (
                  <button
                    key={q.number}
                    type="button"
                    className={`qr-grid-cell ${questionState(q)}`}
                    onClick={() => jumpTo(q.number)}
                    title={`Câu ${q.number}: ${STATE_LABEL[questionState(q)]}`}
                  >
                    {q.number}
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>

        <main className="qr-main">
          {data.snapshotAvailable === false && (
            <div className="qr-card qr-fallback-note">
              Nội dung câu hỏi và đáp án đúng được tải lại từ dữ liệu hiện tại.
              Lượt làm bài cũ không còn lưu đáp án đã chọn, nên không thể xác định câu bạn đã chọn.
            </div>
          )}
          {!data.hasDetails ? (
            <div className="qr-card qr-empty">
              Lượt làm bài này không còn dữ liệu chi tiết từng câu.
            </div>
          ) : (
            <>
              <div className="qr-filters">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`qr-filter ${filter === f.key ? 'active' : ''}`}
                    onClick={() => setFilter(f.key)}
                  >
                    <span className={`qr-filter-mark ${f.key}`} aria-hidden="true">{f.mark}</span>
                    {f.label} <b>{counts[f.key]}</b>
                  </button>
                ))}
              </div>
              {visible.length === 0 ? (
                <div className="qr-card qr-empty">Không có câu nào trong mục này.</div>
              ) : visible.map((q) => <QuestionCard key={q.number} question={q} />)}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default QuizReviewPage;
