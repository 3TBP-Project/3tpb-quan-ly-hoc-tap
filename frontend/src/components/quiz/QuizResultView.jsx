// AI-assisted [AI-06] [AI-25]
const formatScore = (value) => Number(value).toFixed(2).replace(/\.?0+$/, '');
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const PASS_SCORE = 5; // từ 5/10 trở lên coi là đạt (cùng mốc màu điểm ở trang Hồ sơ)

// "11 phút 32 giây" từ lúc bắt đầu tới lúc nộp
const formatDuration = (startedAt, submittedAt) => {
  const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
};

// Màn kết quả theo Figma "HT-06 · Kết quả bài kiểm tra": điểm lớn, 4 ô số liệu,
// thông điệp đạt / chưa đạt, "Xem lại câu sai" (đúng / sai luôn có ký hiệu ✓ / ✕ kèm chữ).
export default function QuizResultView({
  courseTitle,
  result,
  questions = [],
  startedAt,
  attemptNumber = 0,
  remainingAttempts,
  maxAttempts = 3,
  bestBefore = null,
  onRetry,
  onBackToCourse,
  retrying,
  retryError,
}) {
  const {
    score = 0,
    bestScore = 0,
    correctCount = 0,
    totalQuestions = 0,
    submittedAt,
    details = [],
  } = result || {};

  const passed = Number(score) >= PASS_SCORE;
  const wrongCount = Math.max(0, totalQuestions - correctCount);
  const isNewBest = Number(score) >= Number(bestScore) && (bestBefore == null || Number(score) > Number(bestBefore));
  const usedAttempts = attemptNumber || maxAttempts - remainingAttempts;

  // Chữ cái A–D theo đúng thứ tự đáp án đã hiện khi làm bài
  const letterOf = (questionId, answer) => {
    const options = questions.find((q) => q.id === questionId)?.options || [];
    const index = options.indexOf(answer);
    return index >= 0 ? OPTION_LETTERS[index] : '?';
  };
  const numberOf = (questionId, fallback) => {
    const index = questions.findIndex((q) => q.id === questionId);
    return index >= 0 ? index + 1 : fallback;
  };
  const wrongItems = details
    .map((item, i) => ({ ...item, number: numberOf(item.questionId, i + 1) }))
    .filter((item) => !item.isCorrect);

  return (
    <section className="ht-quiz-result" aria-labelledby="ht-quiz-result-title">
      <div className="ht-quiz-result__art" aria-hidden="true">
        <span className={`ht-quiz-result__badge${passed ? '' : ' is-retry'}`}>{passed ? '✓' : '!'}</span>
        <i className="ht-quiz-confetti ht-quiz-confetti--1" />
        <i className="ht-quiz-confetti ht-quiz-confetti--2" />
        <i className="ht-quiz-confetti ht-quiz-confetti--3" />
      </div>

      <h1 id="ht-quiz-result-title" className="ht-quiz-result__title">
        Bạn đạt {formatScore(score)}/10 điểm
      </h1>
      <p className="ht-quiz-result__sub">
        {courseTitle ? `${courseTitle} · ` : ''}Điểm cao nhất của bạn: {formatScore(bestScore)}/10 · Đã dùng {usedAttempts}/
        {maxAttempts} lượt làm bài.
      </p>

      <dl className="ht-quiz-stats">
        <div className="ht-quiz-stat">
          <dt>Số câu đúng</dt>
          <dd className="is-correct">✓ {correctCount} câu</dd>
        </div>
        <div className="ht-quiz-stat">
          <dt>Số câu sai</dt>
          <dd className="is-wrong">✕ {wrongCount} câu</dd>
        </div>
        <div className="ht-quiz-stat">
          <dt>Thời gian làm</dt>
          <dd>{startedAt && submittedAt ? formatDuration(startedAt, submittedAt) : '—'}</dd>
        </div>
        <div className="ht-quiz-stat">
          <dt>Điểm cao nhất</dt>
          <dd>
            {formatScore(bestScore)} / 10{isNewBest ? ' · mới!' : ''}
          </dd>
        </div>
      </dl>

      {passed ? (
        <div className="ht-quiz-note is-success">
          <span className="ht-quiz-note__icon" aria-hidden="true">✓</span>
          <span>
            <strong>Tuyệt vời, bạn đã vượt qua bài kiểm tra!</strong>
            {wrongItems.length
              ? 'Xem lại câu sai bên dưới để nắm chắc kiến thức trước khi học khóa tiếp theo.'
              : 'Bạn trả lời đúng tất cả các câu hỏi.'}
          </span>
        </div>
      ) : (
        <div className="ht-quiz-note is-warning">
          <span className="ht-quiz-note__icon" aria-hidden="true">!</span>
          <span>
            <strong>Chưa đạt lần này, cố lên nhé!</strong>
            Ôn lại các bài học liên quan tới câu sai bên dưới rồi làm lại để cải thiện điểm.
          </span>
        </div>
      )}

      {wrongItems.length > 0 && (
        <div className="ht-quiz-review">
          <h2 className="ht-quiz-review__title">Xem lại câu sai</h2>
          {wrongItems.map((item) => (
            <div key={item.questionId} className="ht-quiz-review__item">
              <p className="ht-quiz-review__question">Câu {item.number}: {item.content}</p>
              <div className="ht-quiz-answer is-wrong">
                <span className="ht-quiz-answer__letter" aria-hidden="true">
                  {item.selectedAnswer ? letterOf(item.questionId, item.selectedAnswer) : '–'}
                </span>
                <span className="ht-quiz-answer__text">{item.selectedAnswer || 'Chưa chọn đáp án'}</span>
                <span className="ht-quiz-answer__tag">✕ {item.selectedAnswer ? 'Bạn chọn · Sai' : 'Bỏ trống'}</span>
              </div>
              {item.correctAnswer && (
                <div className="ht-quiz-answer is-correct">
                  <span className="ht-quiz-answer__letter" aria-hidden="true">
                    {letterOf(item.questionId, item.correctAnswer)}
                  </span>
                  <span className="ht-quiz-answer__text">{item.correctAnswer}</span>
                  <span className="ht-quiz-answer__tag">✓ Đáp án đúng</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {retryError && (
        <p className="ht-quiz-note is-error" role="alert">
          <span className="ht-quiz-note__icon" aria-hidden="true">✕</span>
          <span>{retryError}</span>
        </p>
      )}

      <div className="ht-quiz-actions">
        <button type="button" className="ht-btn ht-btn--primary" onClick={onBackToCourse}>
          Về khóa học
        </button>
        {remainingAttempts > 0 ? (
          <button type="button" className="ht-btn ht-btn--secondary" onClick={onRetry} disabled={retrying}>
            {retrying ? 'Đang tạo lượt mới...' : `Làm lại (còn ${remainingAttempts} lượt)`}
          </button>
        ) : (
          <span className="ht-quiz-result__out">
            Bạn đã dùng hết {maxAttempts}/{maxAttempts} lượt làm bài cho khóa học này.
          </span>
        )}
      </div>
    </section>
  );
}
