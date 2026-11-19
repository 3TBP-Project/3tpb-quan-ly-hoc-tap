// Chỉ nhận YouTube/Facebook để không nhúng iframe từ trang lạ
export function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      return u.pathname.startsWith('/embed/') ? url : null;
    }
    if (host === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    if (host === 'facebook.com') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }
  } catch {
    // link không hợp lệ
  }
  return null;
}