// AI-assisted [AI-06] [AI-25]
import { useCallback, useEffect, useRef, useState } from 'react';

export default function QuizTimer({ startedAt, quizDurationMinutes, disabled, onTimeUp, variant = 'pill' }) {
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

  // Figma "Đồng hồ": viên thuốc "Còn 12:45"; còn ≤ 2 phút chuyển đỏ, ≤ 30 giây nhấp nháy nhẹ.
  // variant="chip": dạng nhỏ dùng trong hộp xác nhận nộp bài.
  let timerClass = `ht-quiz-timer ht-quiz-timer--${variant}`;
  if (secondsLeft <= 30) {
    timerClass += ' is-danger';
  } else if (secondsLeft <= 120) {
    timerClass += ' is-warning';
  }

  return (
    <span
      className={timerClass}
      role="timer"
      aria-label={`Thời gian còn lại ${minutes} phút ${seconds} giây`}
      title="Thời hạn chính thức được kiểm tra tại máy chủ"
    >
      {variant === 'chip' && <ClockIcon />}
      Còn {minutes}:{seconds}
    </span>
  );
}

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
  </svg>
);