import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function StatusPage({ code, title, message }) {
    return (
        <div className="text-center py-5">
            <h1 className="display-1 fw-bold text-primary">{code}</h1>
            <h2 className="h4">{title}</h2>
            <p className="text-muted">{message}</p>
            <Button as={Link} to="/" variant="primary">Trở lại trang chủ</Button>
        </div>
    );
}

export default StatusPage;