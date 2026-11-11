// AI-assisted [AI-03]
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function CourseCard({ course }) {
    return (
        <Card className="h-100 shadow-sm">
            <Card.Img
                variant="top"
                src={course.coverImage}
                alt={course.title}
                style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
            />
            <Card.Body>
                <Card.Title as="h3" className="h5">
                    <Link
                        to={`/courses/${course.id}`}
                        className="stretched-link text-decoration-none"
                    >
                        {course.title}
                    </Link>
                </Card.Title>
                <Card.Text className="mb-1 text-muted">
                    Giảng viên: {course.teacherName}
                </Card.Text>
                <Card.Text className="small text-muted">
                    Số bài học: {course.lessonCount}
                </Card.Text>
            </Card.Body>
        </Card>
    );
}

export default CourseCard;
