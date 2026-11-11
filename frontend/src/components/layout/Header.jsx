// AI-assisted [AI-04]
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

const currentRole = null;

const MENU_BY_ROLE = {
  guest: [{ to: '/', label: 'Khóa học' }],
  student: [
    { to: '/', label: 'Khóa học' },
    { to: '/my-courses', label: 'Khóa học của tôi' },
    { to: '/profile', label: 'Hồ sơ' },
  ],
  teacher: [
    { to: '/', label: 'Khóa học' },
    { to: '/teacher/courses', label: 'Quản lý khóa học' },
  ],
  admin: [
    { to: '/admin/users', label: 'Người dùng' },
    { to: '/admin/categories', label: 'Danh mục, duyệt khóa học' },
  ],
};

function Header() {
  const role = currentRole ?? 'guest';

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Quản Lý Học Tập
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {MENU_BY_ROLE[role].map((item) => (
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
          <Nav>
            {role === 'guest' ? (
              <>
                <Nav.Link as={Link} to="/login">
                  Đăng nhập
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Đăng ký
                </Nav.Link>
              </>
            ) : (
              <Button variant="outline-light" size="sm">
                Đăng xuất
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
