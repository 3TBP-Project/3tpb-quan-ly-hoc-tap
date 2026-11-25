// AI-assisted [AI-18]
import './auth.css';

// Khung chung cho trang đăng nhập / đăng ký (Figma "HT-03 · Đăng nhập / Đăng ký"):
// bên trái là khối minh họa gradient (ẩn trên điện thoại), bên phải là thẻ form.
function AuthLayout({ children }) {
  return (
    <div className="ht-auth">
      <aside className="ht-auth__art" aria-hidden="true">
        <span className="ht-auth__brand">Học Vui</span>
        <span className="ht-auth__blob" />
        <span className="ht-auth__sticker" />
        <span className="ht-auth__dot" />
        <span className="ht-auth__slogan">Học mỗi ngày, tiến bộ mỗi tuần</span>
      </aside>
      <div className="ht-auth__form-area">
        <div className="ht-auth__card">{children}</div>
      </div>
    </div>
  );
}

// Hộp thông báo trong form: lỗi (đỏ, ✕), cảnh báo (vàng, ⚠), thành công (xanh, ✓)
export function AuthAlert({ tone = 'error', title, children }) {
  const icon = { error: '✕', warning: '⚠', success: '✓' }[tone];
  return (
    <div className={`ht-auth-alert ht-auth-alert--${tone}`} role={tone === 'success' ? 'status' : 'alert'}>
      <span className="ht-auth-alert__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        {title && <p className="ht-auth-alert__title">{title}</p>}
        <p className="ht-auth-alert__text">{children}</p>
      </div>
    </div>
  );
}

export default AuthLayout;
