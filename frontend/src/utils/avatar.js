// Đường dẫn ảnh đại diện lưu trong CSDL là tương đối với backend:
// "/uploads/avatars/x.webp" -> "http://localhost:5000/uploads/avatars/x.webp"
export const toAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return `${base}${avatar}`;
};

// Chữ cái đại diện khi chưa có ảnh: lấy chữ cái đầu của tên (từ cuối cùng, theo kiểu tên Việt)
export const avatarInitial = (name = '') =>
  String(name).trim().split(/\s+/).at(-1)?.charAt(0).toUpperCase() || '?';
