import StatusPage from '../components/common/StatusPage';

function NotFoundPage() {
  return <StatusPage code={404} title="Không tìm thấy trang" message="Trang bạn yêu cầu không tồn tại." />;
}

export default NotFoundPage;