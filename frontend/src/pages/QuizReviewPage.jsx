// HT-07: Xem lại bài làm cũ – vì sao được bấy nhiêu điểm.
// Mỗi câu hiển thị 4 lựa chọn đúng thứ tự lúc làm bài, đáp án đã chọn và đáp án đúng.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import { useFetch } from '../hooks/useFetch';
import NotFoundPage from './NotFoundPage';
import { getAttemptReview } from '../services/profileService';
import './QuizReviewPage.css';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'wrong', label: 'Sai' },
  { key: 'unanswered', label: 'Bỏ trống' },
  { key: 'correct', label: 'Đúng' },
];

const formatScore = (score) => Number(score).toFixed(1);
const scoreClass = (score) => (score >= 8 ? 'high' : score >= 5 ? 'mid' : 'low');

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const questionState = (q) => (q.isCorrect ? 'correct' : q.isAnswered ? 'wrong' : 'unanswered');

const STATE_LABEL = { correct: 'Đúng', wrong: 'Sai', unanswered: 'Bỏ trống' };

function OptionRow({ option, question }) {
  const isSelected = option.label === question.selectedLabel;
  const isCorrect = option.label === question.correctLabel;
  let tone = '';
  if (isCorrect) tone = 'is-correct';
  else if (isSelected) tone = 'is-wrong';

  return (
    <li className={`qr-option ${tone} ${isSelected ? 'is-selected' : ''}`}>
      <span className="qr-option-label">{option.label}.</span>
      <span className="qr-option-text">{option.text}</span>
      {isSelected && <span className="qr-option-tag">Bạn chọn</span>}
      {isCorrect && !isSelected && <span className="qr-option-tag correct">Đáp án đúng</span>}
    </li>
  );
}

function QuestionCard({ question, maxAttempts }) {
  const state = questionState(question);
  return (
    <article id={`qr-question-${question.number}`} className={`qr-question ${state}`}>
      <header className="qr-question-head">
        <span className="qr-question-number">Câu {question.number}</span>
        <span className={`qr-pill ${state}`}>{STATE_LABEL[state]}</span>
      </header>
      <p className="qr-question-content">{question.content}</p>

      {question.options.length > 0 ? (
        <ol className="qr-options">
          {question.options.map((option) => (
            <OptionRow key={option.label} option={option} question={question} />
          ))}
        </ol>
      ) : (
        <p className="qr-muted">Không còn dữ liệu các lựa chọn của câu này.</p>
      )}

      <footer className="qr-answer-bar">
        <span className="qr-answer-key">
          {question.correctAnswer != null ? (
            <>Đáp án: <b>{question.correctLabel ?? question.correctAnswer}</b></>
          ) : (
            <span className="qr-answer-hidden">Đáp án: ẩn đến khi dùng hết {maxAttempts} lượt</span>
          )}
          {!question.isAnswered && <span className="qr-answer-skip"></span>}
        </span>
        {question.options.length > 0 && (
          <span className="qr-bubbles" aria-label={question.selectedLabel ? `Bạn chọn ${question.selectedLabel}` : 'Bạn chưa chọn'}>
            {question.options.map((option) => {
              const selected = option.label === question.selectedLabel;
              const correct = option.label === question.correctLabel;
              return (
                <span
                  key={option.label}
                  className={`qr-bubble ${selected ? (question.isCorrect ? 'chosen-correct' : 'chosen-wrong') : ''} ${correct ? 'key' : ''}`}
                >
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
    // Đợi danh sách hiện đủ câu rồi mới cuộn tới
    requestAnimationFrame(() => {
      document.getElementById(`qr-question-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="quiz-review-page">
      <Link to="/profile" state={{ tab: 'history' }} className="qr-back">← Lịch sử làm bài</Link>
      <h1 className="qr-title">Xem lại bài làm</h1>
      <p className="qr-sub">
        {data.courseTitle} · Lần {data.attemptNumber}/{data.maxAttempts}
      </p>

      <div className="qr-layout">
        <aside className="qr-side">
          <section className="qr-card qr-summary">
            <div className={`qr-score ${scoreClass(data.score)}`}>
              <b>{formatScore(data.score)}</b>
              <span>/ 10 điểm</span>
            </div>
            {data.hasDetails && (
              <p className="qr-score-why">
                Đúng {data.correctCount}/{data.totalQuestions} câu, mỗi câu{' '}
                {Number((10 / data.totalQuestions).toFixed(2))} điểm
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
              <div><dt>Thời gian làm</dt><dd>{data.durationMinutes ? `${data.durationMinutes} phút` : '—'}</dd></div>
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
              <div className="qr-legend">
                <span><i className="correct" /> Đúng</span>
                <span><i className="wrong" /> Sai</span>
                <span><i className="unanswered" /> Bỏ trống</span>
              </div>
            </section>
          )}
        </aside>

        <main className="qr-main">
          {!data.hasDetails ? (
            <div className="qr-card qr-empty">
              Lượt làm bài này được thực hiện trước khi hệ thống lưu chi tiết từng câu,
              nên chỉ xem được điểm tổng. Các lượt làm bài từ nay trở đi sẽ xem lại được đầy đủ.
            </div>
          ) : (
            <>
              {!data.answersRevealed && (
                <div className="qr-notice" role="note">
                  Bạn mới dùng {data.attemptsUsed}/{data.maxAttempts} lượt nên đáp án đúng của các câu sai
                  hoặc bỏ trống đang được ẩn. Dùng hết {data.maxAttempts} lượt thì sẽ xem được toàn bộ đáp án.
                </div>
              )}
              <div className="qr-filters" role="tablist">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={filter === f.key}
                    className={`qr-filter ${filter === f.key ? 'active' : ''}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label} <span>{counts[f.key]}</span>
                  </button>
                ))}
              </div>
              {visible.length === 0 ? (
                <div className="qr-card qr-empty">Không có câu nào trong mục này.</div>
              ) : (
                visible.map((q) => <QuestionCard key={q.number} question={q} maxAttempts={data.maxAttempts} />)
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default QuizReviewPage;
