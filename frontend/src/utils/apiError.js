export function parseApiError(error) {
    const data = error.response?.data;
    return {
        message: data?.message ?? 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
        fieldErrors: data?.errors ?? {},
    };
}