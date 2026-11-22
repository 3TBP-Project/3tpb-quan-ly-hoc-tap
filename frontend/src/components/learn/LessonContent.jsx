// AI-assisted [AI-13]
import { useState } from 'react';
import { Alert, Button, Ratio } from 'react-bootstrap';
import { toEmbedUrl } from '../../utils/video';
import { downloadLessonFile } from '../../services/lessonService';

function LessonContent({ lesson }) {
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
    <>
      <h1 className="h4 mb-3">{lesson.title}</h1>
      {embedUrl && (
        <Ratio aspectRatio="16x9" className="mb-3">
          <iframe src={embedUrl} title={lesson.title} allowFullScreen />
        </Ratio>
      )}
      <p style={{ whiteSpace: 'pre-line' }}>{lesson.content}</p>
      {lesson.fileUrl && (
        <>
          <Button variant="outline-secondary" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Đang tải...' : 'Tải tài liệu (PDF)'}
          </Button>
          {downloadError && <Alert variant="danger" className="mt-2 mb-0">{downloadError}</Alert>}
        </>
      )}
    </>
  );
}

export default LessonContent;
