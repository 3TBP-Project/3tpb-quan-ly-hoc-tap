// AI-assisted [AI-15]
// Hàm hiển thị dùng chung cho màn Quản lý người dùng (HT-14)

export const ROLE_LABEL = { all: 'Tất cả người dùng', student: 'Học viên', teacher: 'Giảng viên' };

export const fmtNumber = (n) => Number(n ?? 0).toLocaleString('vi-VN');

// "2026-11-14T14:03:00.000Z" -> { date: "14/11/2026", time: "21:03" } theo giờ máy người xem
export const fmtDateTime = (value) => {
  if (!value) return { date: '—', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: '—', time: '' };
  const pad = (x) => String(x).padStart(2, '0');
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

// Chữ cái đầu của tên cuối, dùng làm avatar khi người dùng chưa có ảnh
export const initialOf = (name = '') => {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1]?.[0] ?? '?').toUpperCase();
};

export const coursesText = (u) =>
  `${fmtNumber(u.courses)} khóa ${u.role === 'teacher' ? 'giảng dạy' : 'ghi danh'}`;
