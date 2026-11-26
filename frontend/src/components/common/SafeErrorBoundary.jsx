import { Component } from 'react';
import { Alert, Button } from 'react-bootstrap';

class SafeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="warning" className="my-3">
          <p className="mb-2">Không thể hiển thị nội dung trang lúc này.</p>
          <Button size="sm" variant="outline-dark" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </Alert>
      );
    }
    return this.props.children;
  }
}

export default SafeErrorBoundary;