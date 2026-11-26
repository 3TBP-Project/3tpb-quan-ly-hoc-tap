// AI-assisted [AI-13] [AI-21]
import { useState } from 'react';
import { toEmbedUrl } from '../../utils/video';
import { downloadLessonFile } from '../../services/lessonService';
import { plainLessonTitle } from './lessonTitle';

// Tên tệp hiển thị: lấy từ đường dẫn tệp, không có thì đặt theo tên bài
const pdfName = (lesson) => {
  const fromUrl = decodeURIComponent((lesson.fileUrl || '').split('/').pop() || '');
  return /\.pdf$/i.test(fromUrl) ? fromUrl : `${lesson.title || 'tai-lieu'}.pdf`;
};

// Vùng đọc bài (Figma "Vùng bài đọc"): tiêu đề, video 16:9, nội dung chữ, thẻ tài liệu PDF
function LessonContent({ lesson, number }) {
  const embedUrl = toEmbedUrl(lesson.videoUrl);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // Tệp PDF lưu riêng tư trên server, phải gửi kèm token nên tải qua API
  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadLessonFile(lesson.id, `${lesson.title || 'tai-lieu'}.pdf`);
    } catch {
      setDownloadError('Không tải được tài liệu. Vui lòng thử lại sau.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="ht-lesson-read">
      <h1 className="ht-lesson-read__title">
        Bài {number} · {plainLessonTitle(lesson.title)}
      </h1>

      {embedUrl && (
        <div className="ht-lesson-read__video">
          <iframe src={embedUrl} title={`Video bài ${number}: ${plainLessonTitle(lesson.title)}`} allowFullScreen />
        </div>
      )}

      {lesson.content ? (
        <div className="ht-lesson-read__text">{lesson.content}</div>
      ) : (
        !embedUrl && !lesson.fileUrl && (
          <p className="ht-lesson-read__empty">Bài học này chưa có nội dung.</p>
        )
      )}

      {lesson.fileUrl && (
        <div className="ht-pdf-card">
          <span className="ht-pdf-card__icon" aria-hidden="true">PDF</span>
          <div className="ht-pdf-card__file">
            <span className="ht-pdf-card__name">{pdfName(lesson)}</span>
            <span className="ht-pdf-card__meta">Tài liệu đính kèm của bài học</span>
          </div>
          <button
            type="button"
            className="ht-btn ht-btn--secondary ht-pdf-card__btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Đang tải...' : 'Tải xuống'}
          </button>
          {downloadError && (
            <p className="ht-pdf-card__error" role="alert">✕ {downloadError}</p>
          )}
        </div>
      )}
    </article>
  );
}

export default LessonContent;
