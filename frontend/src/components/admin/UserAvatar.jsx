// AI-assisted [AI-15]
import { initialOf } from '../../utils/userDisplay';

function UserAvatar({ user }) {
  if (user.avatar) return <img className="um-avatar" src={user.avatar} alt="" />;
  return <div className="um-avatar" aria-hidden="true">{initialOf(user.name)}</div>;
}

export default UserAvatar;
