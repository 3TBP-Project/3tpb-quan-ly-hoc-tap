// Đăng xuất cưỡng bức khi server báo tài khoản đã bị khóa:
// xóa phiên, ghi lại thông báo rồi tải lại trang chủ ở chế độ khách vãng lai.
const NOTICE_KEY = 'auth_notice';
let redirecting = false;

export const ACCOUNT_LOCKED = 'ACCOUNT_LOCKED';

export function isAccountLockedPayload(payload) {
  return payload?.code === ACCOUNT_LOCKED;
}

export function forceLogoutLocked(message) {
  if (redirecting) return;
  redirecting = true;
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.setItem(
      NOTICE_KEY,
      message || 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
    );
  } catch {
    // Bỏ qua lỗi bộ nhớ trình duyệt, vẫn chuyển về trang chủ
  }
  // Tải lại toàn trang để xóa sạch trạng thái đăng nhập đang giữ trong React
  window.location.replace('/');
}

// Đọc (và xóa) thông báo để hiển thị một lần ở trang chủ
export function takeAuthNotice() {
  try {
    const message = sessionStorage.getItem(NOTICE_KEY);
    if (message) sessionStorage.removeItem(NOTICE_KEY);
    return message || '';
  } catch {
    return '';
  }
}
