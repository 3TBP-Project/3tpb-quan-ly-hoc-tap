// AI-assisted [AI-16]
import { Link } from 'react-router-dom';
import Logo from './Logo';
import './layout.css';

function Footer() {
  return (
    <footer className="ht-footer mt-auto">
      <div className="container ht-container ht-footer__inner">
        <div className="ht-footer__brand">
          <div className="ht-footer__name">
            <Logo size={40} />
            <span className="ht-footer__tagline">· Hệ thống quản lý học tập</span>
          </div>
          <p className="ht-caption ht-footer__copy">© 2026 Học Vui · Đồ án môn Lập trình Web</p>
        </div>

        <nav aria-label="Liên kết cuối trang" className="ht-footer__links">
          <span>Giới thiệu</span>
          <span aria-hidden="true">·</span>
          <Link to="/">Khóa học</Link>
          <span aria-hidden="true">·</span>
          <span>Liên hệ</span>
          <span aria-hidden="true">·</span>
          <span>Điều khoản</span>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
