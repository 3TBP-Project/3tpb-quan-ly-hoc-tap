// AI-assisted [AI-04] [AI-07] [AI-16]
import { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import UserAvatar from '../common/UserAvatar';
import { applyTheme, getSavedTheme } from '../../utils/theme';
import Logo from './Logo';
import './layout.css';

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
    { to: '/profile', label: 'Hồ sơ' },
  ],
  admin: [
    { to: '/admin/users', label: 'Người dùng' },
    { to: '/admin/categories', label: 'Danh mục' },
    { to: '/admin/courses', label: 'Duyệt khóa học' },
    { to: '/profile', label: 'Hồ sơ' },
  ],
};

const ROLE_LABEL = { student: 'Học viên', teacher: 'Giảng viên', admin: 'Quản trị viên' };

function ThemeToggle() {
  const [theme, setTheme] = useState(getSavedTheme);
  const isDark = theme === 'dark';

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="ht-icon-btn"
      onClick={toggle}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </g>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const menu = MENU_BY_ROLE[role] ?? MENU_BY_ROLE.guest;
  const close = () => setExpanded(false);

  const handleLogout = () => {
    close();
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" expanded={expanded} onToggle={setExpanded} className="ht-header">
      <Container className="ht-container ht-header__inner">
        <Navbar.Toggle aria-controls="main-nav" className="ht-header__toggle" aria-label="Mở menu">
          <span className="ht-burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </Navbar.Toggle>

        <Navbar.Brand as={Link} to="/" onClick={close} className="ht-header__brand">
          <Logo />
        </Navbar.Brand>

        <div className="ht-header__theme-mobile d-lg-none">
          <ThemeToggle />
        </div>

        <Navbar.Collapse id="main-nav">
          <Nav className="ht-nav me-auto">
            {menu.map((item) => (
              <Nav.Link
                key={item.to}
                as={NavLink}
                to={item.to}
                end={item.to === '/'}
                onClick={close}
                className="ht-nav__link"
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="ht-header__actions">
            <div className="d-none d-lg-block">
              <ThemeToggle />
            </div>
            {user ? (
              <>
                <div className="ht-user">
                  <UserAvatar avatar={user.avatar} name={user.name}
                    className="ht-user__avatar" imgClassName="ht-user__avatar-img" />
                  <span className="ht-user__text">
                    <span className="ht-user__name" title={user.name}>{user.name}</span>
                    <span className="ht-user__role">{ROLE_LABEL[role] ?? ''}</span>
                  </span>
                </div>
                <button type="button" className="ht-btn ht-btn--ghost" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close} className="ht-btn ht-btn--secondary">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={close} className="ht-btn ht-btn--primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
