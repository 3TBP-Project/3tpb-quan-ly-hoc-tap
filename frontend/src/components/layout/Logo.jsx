// AI-assisted [AI-16]
// Logo nhóm 3TBP (ảnh PNG nền trong suốt) + tên "Học Vui"
import logoUrl from '../../assets/logo.png';

function Logo({ size = 44 }) {
  return (
    <span className="ht-logo">
      <img src={logoUrl} alt="" className="ht-logo__img" style={{ height: size }} />
      <span className="ht-logo__text">Học Vui</span>
    </span>
  );
}

export default Logo;
