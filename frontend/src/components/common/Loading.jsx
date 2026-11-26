import { Spinner } from 'react-bootstrap';

function Loading({ label = 'Đang tải...' }) {
  return (
    <div className="text-center py-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">{label}</span>
      </Spinner>
    </div>
  );
}

export default Loading;
