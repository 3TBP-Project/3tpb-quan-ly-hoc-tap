// AI-assisted [AI-08]
import { useEffect, useState } from 'react';
import { parseApiError } from '../utils/apiError';

/**
 * Hook gọi API dùng chung cho mọi màn hình (Lab 8: có cleanup, tránh kết quả cũ ghi đè kết quả mới).
 *
 * fetcher: hàm (params, signal) => Promise trả về { data } (dạng phản hồi của backend).
 *          Phải là hàm ổn định (khai báo ở ngoài component).
 * params:  đối tượng tham số; đổi giá trị thì tự gọi lại.
 *
 * Trả về { data, loading, error }.
 */
export function useFetch(fetcher, params = null) {
  const key = JSON.stringify(params);
  const [result, setResult] = useState({ key: undefined, data: null, error: null });

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    fetcher(JSON.parse(key), controller.signal)
      .then((res) => {
        if (!ignore) setResult({ key, data: res.data, error: null });
      })
      .catch((err) => {
        if (!ignore) setResult({ key, data: null, error: parseApiError(err).message });
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
  };
}
