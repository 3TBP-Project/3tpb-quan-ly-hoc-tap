// AI-assisted [AI-13]
import { Ratio } from 'react-bootstrap';
import { toEmbedUrl } from '../../utils/video';

function LessonContent({ lesson }) {
  const embedUrl = toEmbedUrl(lesson.videoUrl);
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
        <a href={lesson.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">
          Tải tài liệu (PDF)
        </a>
      )}
    </>
  );
}

export default LessonContent;