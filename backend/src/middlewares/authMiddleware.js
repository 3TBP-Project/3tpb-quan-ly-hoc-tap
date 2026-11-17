// AI-assisted [AI-02]
const jwt = require('jsonwebtoken');

// 1. Xác thực JWT Token từ Header Authorization
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Định dạng: Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Truy cập bị từ chối. Vui lòng đăng nhập để lấy token.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Gắn { id, email, role } vào req để các bước sau sử dụng
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ hoặc đã hết hạn.'
    });
  }
};

// 2. Kiểm tra vai trò được phép truy cập
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Bạn không có quyền truy cập khu vực này (Yêu cầu vai trò: ${allowedRoles.join(', ')}).`
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };