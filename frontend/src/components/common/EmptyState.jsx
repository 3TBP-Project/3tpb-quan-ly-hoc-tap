function EmptyState({ message = 'Không có dữ liệu.' }) {
  return <div className="text-center text-muted py-5">{message}</div>;
}

export default EmptyState;
