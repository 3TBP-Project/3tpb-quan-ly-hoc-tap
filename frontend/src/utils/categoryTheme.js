// AI-assisted [AI-16]
// Mỗi danh mục có 1 màu riêng và 1 "sticker" trên ảnh bìa (biến cat/* trong Figma).
const THEMES = {
  'lap-trinh': '</>',
  'du-lieu': '123',
  'thiet-ke': 'Aa',
  'ngoai-ngu': 'Hi!',
  'kinh-doanh': '$',
  marketing: '#',
};

// Ưu tiên đoán theo tên danh mục; không khớp thì chia màu theo id
const KEYWORDS = [
  ['thiet-ke', ['thiết kế', 'ui/ux', 'đồ họa']],
  ['du-lieu', ['dữ liệu', 'data']],
  ['ngoai-ngu', ['ngoại ngữ', 'tiếng anh', 'tiếng nhật', 'english']],
  ['kinh-doanh', ['kinh doanh', 'quản trị', 'tài chính']],
  ['marketing', ['marketing', 'truyền thông']],
  ['lap-trinh', ['lập trình', 'web', 'mobile']],
];

const ORDER = Object.keys(THEMES);

export function getCategoryTheme(categoryName, categoryId) {
  const name = String(categoryName ?? '').toLowerCase();
  const match = KEYWORDS.find(([, words]) => words.some((w) => name.includes(w)));
  const key = match ? match[0] : ORDER[Math.abs(Number(categoryId) || 0) % ORDER.length];
  return { key, className: `ht-cat--${key}`, sticker: THEMES[key] };
}

// "Lê Minh Châu" -> "MC" (chữ cái đầu của tên đệm cuối và tên)
export function getInitials(fullName) {
  const words = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
}
