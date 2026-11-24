// AI-assisted [AI-06]
const formatScore = (value) => Number(value).toFixed(2).replace(/\.?0+$/, '');

export default function QuizResultView({
  courseTitle,
  result,
  remainingAttempts,
  maxAttempts = 3,
  onRetry,
  onBackToCourse,
  retrying,
}) {
  const {
    score = 0,
    bestScore = 0,
    correctCount = 0,
    totalQuestions = 0,
    submittedAt,
    details = [],
    answersRevealed = true,
  } = result || {};

  const formattedSubmittedTime = submittedAt
    ? new Date(submittedAt).toLocaleString('vi-VN')
    : '';

  return (
    <div className="quiz-result">
      <div className="quiz-result__summary-card">
        <div className="quiz-result__header">
          <span className="quiz-badge quiz-badge--success">Đã hoàn thành bài kiểm tra</span>
          <h2 className="quiz-result__title">{courseTitle || 'Bài kiểm tra khóa học'}</h2>
          {formattedSubmittedTime && (
            <p className="quiz-result__timestamp">Thời gian nộp bài: {formattedSubmittedTime}</p>
          )}
        </div>

        <div className="quiz-result__metrics">
          <div className="quiz-metric quiz-metric--primary">
            <span className="quiz-metric__label">Điểm lượt này</span>
            <strong className="quiz-metric__value">{formatScore(score)} / 10</strong>
          </div>

          <div className="quiz-metric">
            <span className="quiz-metric__label">Điểm cao nhất</span>
            <strong className="quiz-metric__value">{formatScore(bestScore)} / 10</strong>
          </div>

          <div className="quiz-metric">
            <span className="quiz-metric__label">Số câu đúng</span>
            <strong className="quiz-metric__value">
              {correctCount} / {totalQuestions} câu
            </strong>
          </div>

          <div className="quiz-metric">
            <span className="quiz-metric__label">Số lượt còn lại</span>
            <strong className="quiz-metric__value">
              {remainingAttempts} / {maxAttempts} lượt
            </strong>
          </div>
        </div>

        <div className="quiz-result__actions">
          {remainingAttempts > 0 ? (
            <button
              type="button"
              className="quiz-btn quiz-btn--primary"
              onClick={onRetry}
              disabled={retrying}
            >
              {retrying
                ? 'Đang tạo lượt làm bài mới...'
                : `Làm lại bài kiểm tra (Còn ${remainingAttempts} lượt)`}
            </button>
          ) : (
            <span className="quiz-result__no-attempts">
              Bạn đã sử dụng hết {maxAttempts}/{maxAttempts} lượt làm bài cho khóa học này.
            </span>
          )}

          <button
            type="button"
            className="quiz-btn quiz-btn--secondary"
            onClick={onBackToCourse}
          >
            Quay lại danh sách khóa học
          </button>
        </div>
      </div>

      <div className="quiz-result__review-section">
        <h3 className="quiz-result__section-heading">Chi tiết đáp án sau khi nộp bài</h3>
        {!answersRevealed && (
          <p className="quiz-result__answers-hidden">
            Đáp án đúng của các câu sai / bỏ trống sẽ được hiển thị khi bạn đã dùng hết {maxAttempts} lượt làm bài.
          </p>
        )}

        <div className="quiz-review-list">
          {details.map((item, index) => (
            <div
              key={item.questionId}
              className={`quiz-review-item ${
                item.isCorrect ? 'quiz-review-item--correct' : 'quiz-review-item--wrong'
              }`}
            >
              <div className="quiz-review-item__top">
                <span className="quiz-review-item__number">Câu {index + 1}</span>
                <span
                  className={`quiz-status-pill ${
                    item.isCorrect ? 'quiz-status-pill--correct' : 'quiz-status-pill--wrong'
                  }`}
                >
                  {item.isCorrect ? 'Chính xác' : 'Chưa đúng'}
                </span>
              </div>

              <p className="quiz-review-item__question">{item.content}</p>

              <div className="quiz-review-item__answers">
                <p className="quiz-review-item__answer-row">
                  <span>Đáp án bạn chọn: </span>
                  <strong className={item.isCorrect ? 'text-success' : 'text-danger'}>
                    {item.selectedAnswer || 'Chưa chọn đáp án'}
                  </strong>
                </p>
                <p className="quiz-review-item__answer-row">
                  <span>Đáp án: </span>
                  {item.correctAnswer != null ? (
                    <strong className="text-success">{item.correctAnswer}</strong>
                  ) : (
                    <span className="text-muted fst-italic">Ẩn cho đến khi bạn dùng hết {maxAttempts} lượt</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}