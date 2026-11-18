// AI-assisted [AI-08]
import { Pagination as BsPagination } from 'react-bootstrap';
import { getPageItems } from '../../utils/pagination';

/**
 * Phân trang dùng chung cho mọi danh sách (wireframe: ‹ Trước 1 2 3 … 6 Sau ›).
 * Chỉ báo số trang mới qua onPageChange; việc lấy dữ liệu do trang cha làm.
 */
function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <BsPagination className="justify-content-center flex-wrap mb-0">
      <BsPagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ‹ Trước
      </BsPagination.Prev>

      {getPageItems(page, totalPages).map((item) =>
        typeof item === 'number' ? (
          <BsPagination.Item
            key={item}
            active={item === page}
            onClick={() => onPageChange(item)}
          >
            {item}
          </BsPagination.Item>
        ) : (
          <BsPagination.Ellipsis key={item} disabled />
        ),
      )}

      <BsPagination.Next disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Sau ›
      </BsPagination.Next>
    </BsPagination>
  );
}

export default Pagination;
