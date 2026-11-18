// Tiêu đề trang dùng chung: tiêu đề, dòng phụ đề và vùng nút thao tác (nếu có)
function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

export default PageHeader;
