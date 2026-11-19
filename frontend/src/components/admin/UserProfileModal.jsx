// AI-assisted [AI-15]
import { Button, ListGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { getUserById } from '../../services/userService';
import { coursesText, fmtDateTime, ROLE_LABEL } from '../../utils/userDisplay';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import UserAvatar from './UserAvatar';

function UserProfileModal({ userId, onClose }) {
  const { data: user, loading, error } = useFetch(getUserById, { id: userId });
  const registered = fmtDateTime(user?.createdAt);

  return (
    <Modal show onHide={onClose} centered className="um-modal">
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5">Hồ sơ người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Loading />}
        {error && <ErrorMessage message={error} />}
        {!loading && user && (
          <>
            <div className="um-profile-head">
              <UserAvatar user={user} />
              <div>
                <div className="um-user-name fs-5">{user.name}</div>
                <div className="um-user-email">{user.email}</div>
              </div>
            </div>
            <dl className="um-profile-grid">
              <dt>Vai trò</dt>
              <dd>
                <span className={`um-badge um-badge-${user.role}`}>{ROLE_LABEL[user.role]}</span>
              </dd>
              <dt>Trạng thái</dt>
              <dd>
                {user.status === 'locked'
                  ? <span className="um-badge um-badge-locked">Bị chặn</span>
                  : <span className="um-badge um-badge-active">Hoạt động</span>}
              </dd>
              <dt>Ngày đăng ký</dt>
              <dd>{registered.date} {registered.time}</dd>
              <dt>{user.role === 'teacher' ? 'Giảng dạy' : 'Ghi danh'}</dt>
              <dd>{coursesText(user)}</dd>
            </dl>
            {user.courseList?.length > 0 && (
              <ListGroup className="um-course-list">
                {user.courseList.map((c) => (
                  <ListGroup.Item key={c.id} action as={Link} to={`/courses/${c.id}`} onClick={onClose}>
                    {c.title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserProfileModal;
