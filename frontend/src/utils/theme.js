// AI-assisted [AI-16]
// Chế độ sáng / tối: lưu lựa chọn trong localStorage, mặc định là sáng.
// Đặt data-theme (màu "Học Vui") và data-bs-theme (thành phần Bootstrap) trên thẻ <html>.
const STORAGE_KEY = 'ht-theme';

export function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.bsTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Trình duyệt chặn lưu trữ: vẫn đổi giao diện trong phiên hiện tại
  }
}
