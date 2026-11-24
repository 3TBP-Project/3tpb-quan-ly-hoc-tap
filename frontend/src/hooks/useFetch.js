// AI-assisted [AI-08] [AI-09]
import { useEffect, useState } from 'react';
import { parseApiError } from '../utils/apiError';

/**
 * Hook gọi API dùng chung cho mọi màn hình (Lab 8: có cleanup, tránh kết quả cũ ghi đè kết quả mới).
 *
 * fetcher: hàm (params, signal) => Promise trả về { data } (dạng phản hồi của backend).
 *          Phải là hàm ổn định (khai báo ở ngoài component).
 * params:  đối tượng tham số; đổi giá trị thì tự gọi lại.
 *
 * Trả về { data, loading, error, status } (status = mã HTTP khi lỗi, ví dụ 404; không lỗi thì null).
 */
export function useFetch(fetcher, params = null) {
  const key = JSON.stringify(params);
  const [result, setResult] = useState({ key: undefined, data: null, error: null, status: null });

  useEffect(() => {
    let ignore = false;

    if (typeof fetcher !== 'function') {
      setResult({ key, data: null, error: null, status: null });
      return undefined;
    }

    const controller = new AbortController();

    fetcher(JSON.parse(key), controller.signal)
      .then((res) => {
        if (!ignore) setResult({ key, data: res.data, error: null, status: null });
      })
      .catch((err) => {
        if (ignore) return;
        setResult({ key, data: null, error: parseApiError(err).message, status: err.response?.status ?? null });
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [fetcher, key]);

  const settled = result.key === key;
  return {
    data: result.data, // giữ dữ liệu cũ trong lúc tải để không bị giật
    loading: !settled,
    error: settled ? result.error : null,
    status: settled ? result.status : null,
  };
}
