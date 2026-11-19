// AI-assisted [AI-06]
import { useCallback, useEffect, useRef, useState } from 'react';

export default function QuizTimer({ startedAt, quizDurationMinutes, disabled, onTimeUp }) {
  const hasTriggeredRef = useRef(false);

  const calculateRemainingSeconds = useCallback(() => {
    const totalSeconds = Math.max(1, Number(quizDurationMinutes || 0)) * 60;
    if (!startedAt) return totalSeconds;

    const startMs = new Date(startedAt).getTime();
    if (Number.isNaN(startMs)) return totalSeconds;

    const endMs = startMs + totalSeconds * 1000;
    const diffSeconds = Math.floor((endMs - Date.now()) / 1000);

    // Dự phòng nếu đồng hồ máy client lệch nhẹ lúc vừa bắt đầu
    if (diffSeconds > totalSeconds) return totalSeconds;
    return Math.max(0, diffSeconds);
  }, [startedAt, quizDurationMinutes]);

  const [secondsLeft, setSecondsLeft] = useState(calculateRemainingSeconds);

  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [calculateRemainingSeconds]);

  useEffect(() => {
    if (disabled) return undefined;

    const timerId = setInterval(() => {
      const nextSeconds = calculateRemainingSeconds();
      setSecondsLeft(nextSeconds);

      if (nextSeconds <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        clearInterval(timerId);
        if (typeof onTimeUp === 'function') {
          onTimeUp();
        }
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [disabled, calculateRemainingSeconds, onTimeUp]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  let timerClass = 'quiz-timer';
  if (secondsLeft <= 30) {
    timerClass += ' quiz-timer--danger';
  } else if (secondsLeft <= 120) {
    timerClass += ' quiz-timer--warning';
  }

  return (
    <div className={timerClass} role="timer" aria-live="polite" title="Thời hạn chính thức được kiểm tra tại máy chủ">
      <span className="quiz-timer__label">Thời gian còn lại:</span>
      <strong className="quiz-timer__value">
        {minutes}:{seconds}
      </strong>
    </div>
  );
}