// [HT-04] Thanh + con số % tiến độ hiển thị trên từng thẻ khóa học.
import { ProgressBar } from 'react-bootstrap';
import { calcProgressPercent } from '../../utils/progress';

function CourseProgress({ completedCount = 0, totalCount = 0, progressPercent }) {
  const percent =
    typeof progressPercent === 'number'
      ? progressPercent
      : calcProgressPercent(completedCount, totalCount);
  const done = Number(completedCount) || 0;
  const total = Number(totalCount) || 0;

  return (
    <div aria-label={`Tiến độ ${percent}%`}>
      <div className="d-flex justify-content-between align-items-center small mb-1">
        <span className="text-muted">
          Tiến độ: {done}/{total} bài
        </span>
        <strong data-testid="course-progress-percent">{percent}%</strong>
      </div>
      <ProgressBar
        now={percent}
        visuallyHidden={false}
        label={undefined}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

export default CourseProgress;
