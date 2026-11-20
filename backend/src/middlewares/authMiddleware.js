// AI-assisted [AI-02]
const jwt = require('jsonwebtoken');

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const [scheme, token, ...extraParts] = authHeader.trim().split(/\s+/);
  if (scheme !== 'Bearer' || !token || extraParts.length > 0) {
    return res.status(401).json({
      status: 'error',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.'
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.'
    });
  }

  req.user = decoded;
  return next();
};

// 1. Xác thực JWT Token từ Header Authorization
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Định dạng: Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Vui lòng đăng nhập để làm bài trắc nghiệm. Nếu chưa có tài khoản, hãy đăng ký trước.'
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.'
    });
  }

  req.user = decoded; // Gắn { id, email, role } vào req để các bước sau sử dụng
  return next();
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

module.exports = { verifyToken, optionalVerifyToken, authorizeRoles };