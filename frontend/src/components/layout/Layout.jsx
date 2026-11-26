import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import { takeAuthNotice } from '../../utils/forceLogout';

function Layout() {
  // Thông báo một lần sau khi bị đăng xuất cưỡng bức (ví dụ tài khoản bị khóa)
  const [authNotice, setAuthNotice] = useState(takeAuthNotice);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 container ht-container py-4">
        {authNotice && (
          <Alert variant="warning" dismissible onClose={() => setAuthNotice('')}>
            {authNotice}
          </Alert>
        )}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
