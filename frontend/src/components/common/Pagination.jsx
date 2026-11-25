// AI-assisted [AI-08] [AI-16]
import { getPageItems } from '../../utils/pagination';
import './pagination.css';

/**
 * Phân trang dùng chung (Figma "Pagination · Trang chủ": ‹ Trước 1 2 3 … 6 Sau ›).
 * Điện thoại hiện gọn: ‹  Trang 1 / 6  ›.
 * Chỉ báo số trang mới qua onPageChange; việc lấy dữ liệu do trang cha làm.
 */
function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav className="ht-pagination" aria-label="Phân trang">
      <button
        type="button"
        className="ht-page ht-page--nav"
        disabled={isFirst}
        onClick={() => onPageChange(page - 1)}
        aria-label="Trang trước"
      >
        ‹<span className="ht-page__label"> Trước</span>
      </button>

      <ul className="ht-pagination__pages">
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`ht-page${item === page ? ' ht-page--current' : ''}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item}>
              <span className="ht-page ht-page--ellipsis" aria-hidden="true">
                …
              </span>
            </li>
          ),
        )}
      </ul>

      <span className="ht-pagination__compact" aria-live="polite">
        Trang {page} / {totalPages}
      </span>

      <button
        type="button"
        className="ht-page ht-page--nav"
        disabled={isLast}
        onClick={() => onPageChange(page + 1)}
        aria-label="Trang sau"
      >
        <span className="ht-page__label">Sau </span>›
      </button>
    </nav>
  );
}

export default Pagination;
