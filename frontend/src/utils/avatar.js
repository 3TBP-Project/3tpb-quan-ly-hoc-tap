export const toAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (/^https?:\/\//i.test(avatar)) return avatar;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return `${base}${avatar}`;
};

// Ảnh do backend lưu ("/uploads/...", vd. ảnh bìa khóa học) cần gắn địa chỉ API;
// ảnh tĩnh của frontend (vd. "/images/course-default.jpg") giữ nguyên
export const toMediaUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('/uploads/')) return toAvatarUrl(src);
  return src;
};
