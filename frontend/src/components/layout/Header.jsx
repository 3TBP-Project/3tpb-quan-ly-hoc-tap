// AI-assisted [AI-04] [AI-07]
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const MENU_BY_ROLE = {
  guest: [{ to: '/', label: 'Khóa học' }],
  student: [
    { to: '/', label: 'Khóa học' },
    { to: '/my-courses', label: 'Khóa học của tôi' },
    { to: '/profile', label: 'Hồ sơ' },
  ],
  teacher: [
    { to: '/', label: 'Khóa học' },
    { to: '/teacher/lessons', label: 'Quản lý bài học' },
    { to: '/teacher/questions', label: 'Quản lý câu hỏi' },
  ],
  admin: [
    { to: '/admin/users', label: 'Người dùng' },
    { to: '/admin/categories', label: 'Danh mục, duyệt khóa học' },
  ],
};

function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const menu = MENU_BY_ROLE[role] ?? MENU_BY_ROLE.guest;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Quản Lý Học Tập
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {menu.map((item) => (
              <Nav.Link
                key={item.to}
                as={NavLink}
                to={item.to}
                end={item.to === '/'}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <Nav className="align-items-md-center">
            {user ? (
              <>
                <Navbar.Text className="me-md-3">Xin chào, {user.name}</Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Đăng nhập
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Đăng ký
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
