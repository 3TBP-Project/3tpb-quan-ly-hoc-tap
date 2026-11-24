// Ảnh đại diện dùng chung cho mọi nơi hiển thị người dùng (header, thẻ khóa học, quản trị...).
// Có ảnh thì hiện ảnh; chưa có ảnh hoặc ảnh lỗi thì hiện chữ cái đầu trên nền màu theo vai trò.
import { useState } from 'react';
import { avatarInitial, toAvatarUrl } from '../../utils/avatar';
import './UserAvatar.css';

function UserAvatar({ name = '', avatar, size = 32, role, className = '', decorative = true }) {
  const src = toAvatarUrl(avatar);
  // Ghi nhớ đường dẫn bị lỗi; đổi ảnh khác thì tự thử lại
  const [brokenSrc, setBrokenSrc] = useState('');
  const showImage = Boolean(src) && brokenSrc !== src;

  // size = null: để CSS của nơi dùng tự quyết định kích thước
  const style = size ? { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.42)) } : undefined;
  const classes = `user-avatar ${role ? `user-avatar--${role}` : ''} ${className}`.trim();
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `Ảnh đại diện của ${name}` };

  if (showImage) {
    return (
      <img
        className={`${classes} user-avatar--image`}
        style={style}
        src={src}
        alt={decorative ? '' : `Ảnh đại diện của ${name}`}
        aria-hidden={decorative || undefined}
        loading="lazy"
        onError={() => setBrokenSrc(src)}
      />
    );
  }

  return (
    <span className={classes} style={style} {...a11y}>
      {avatarInitial(name)}
    </span>
  );
}

export default UserAvatar;
