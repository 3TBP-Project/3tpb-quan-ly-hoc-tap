import { useState } from 'react';
import { toAvatarUrl } from '../../utils/avatar';
import { getInitials } from '../../utils/categoryTheme';

/**
 * Ảnh đại diện lấy từ CSDL (users.avatar). Chưa có ảnh hoặc ảnh lỗi (tệp đã bị xóa)
 * thì hiện chữ viết tắt của tên thay cho biểu tượng ảnh vỡ.
 * - className: lớp cho cả hai dạng; imgClassName: lớp thêm khi là ảnh
 */
function AvatarImage({ url, name, className, imgClassName }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return (
      <img className={`${className} ${imgClassName}`.trim()} src={url} alt="" loading="lazy" onError={() => setBroken(true)} />
    );
  }
  return (
    <span className={className} aria-hidden="true">
      {getInitials(name) || '?'}
    </span>
  );
}

export default function UserAvatar({ avatar, name, className = '', imgClassName = '' }) {
  const url = toAvatarUrl(avatar);
  // key theo url: đổi ảnh (vd. vừa cập nhật) thì thử tải lại thay vì giữ trạng thái lỗi cũ
  return <AvatarImage key={url} url={url} name={name} className={className} imgClassName={imgClassName} />;
}
