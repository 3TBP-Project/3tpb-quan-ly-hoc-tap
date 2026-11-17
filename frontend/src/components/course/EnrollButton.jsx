import { Link, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function EnrollButton({ user, courseId, isEnrolled, enrolling, onEnroll }) {
    const location = useLocation();
    if (!user) {
        return (
            <Button as={Link} to="/login" state={{ from: location }} variant="primary">
                Đăng nhập để ghi danh
            </Button>
        );
    }
    if (user.role !== 'student') return null;

    return isEnrolled ? (
        <Button as={Link} to={`/courses/${courseId}/learn`} variant="success" className="w-100">Vào học</Button>
    ) : (
        <Button variant="primary" className="w-100" disabled={enrolling} onClick={onEnroll}>
            {enrolling ? 'Đang ghi danh...' : 'Ghi danh'}
        </Button>
    );
}

export default EnrollButton;