// AI-assisted [AI-26]
import StatusPage from '../components/common/StatusPage';

// Chữ theo Figma "404 · Không tìm thấy trang"
function NotFoundPage() {
  return (
    <StatusPage
      code={404}
      title="Ôi, trang này không tồn tại"
      message="Đường dẫn có thể đã thay đổi hoặc khóa học đã bị ẩn. Hãy quay lại danh sách khóa học nhé."
    />
  );
}

export default NotFoundPage;
