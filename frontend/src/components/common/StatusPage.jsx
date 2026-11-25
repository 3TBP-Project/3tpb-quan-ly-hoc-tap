// AI-assisted [AI-26]
import { Link } from 'react-router-dom';
import './status.css';

// Trang trạng thái (404...) theo Figma "404 · Không tìm thấy trang": mã lỗi rất lớn màu nhấn,
// tiêu đề, một câu giải thích và nút quay về. Vài mảnh trang trí nhỏ chỉ để nhìn, trình đọc màn hình bỏ qua.
function StatusPage({ code, title, message, actionLabel = 'Về danh sách khóa học', actionTo = '/' }) {
  return (
    <section className="ht-status" aria-labelledby="ht-status-title">
      <div className="ht-status__art" aria-hidden="true">
        <i className="ht-status__shape ht-status__shape--1" />
        <i className="ht-status__shape ht-status__shape--2" />
        <i className="ht-status__shape ht-status__shape--3" />
        <span className="ht-status__code">{code}</span>
      </div>
      <h1 id="ht-status-title" className="ht-status__title">
        <span className="visually-hidden">Lỗi {code}: </span>
        {title}
      </h1>
      <p className="ht-status__message">{message}</p>
      <Link to={actionTo} className="ht-btn ht-btn--primary">
        {actionLabel}
      </Link>
    </section>
  );
}

export default StatusPage;
