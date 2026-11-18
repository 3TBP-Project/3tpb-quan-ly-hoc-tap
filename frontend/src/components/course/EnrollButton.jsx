import { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { enrollCourse } from '../../services/courseService';
import { parseApiError } from '../../utils/apiError';

function EnrollButton({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  const handleEnroll = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await enrollCourse(courseId);
      setVariant('success');
      setMessage(response.message || 'Ghi danh thành công!');
    } catch (error) {
      setVariant('danger');
      setMessage(parseApiError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button size="sm" variant="primary" disabled={loading} onClick={handleEnroll}>
        {loading ? 'Đang ghi danh...' : 'Ghi danh khóa học'}
      </Button>
      {message && <Alert className="mt-2 mb-0 py-2 small" variant={variant}>{message}</Alert>}
    </div>
  );
}

export default EnrollButton;
