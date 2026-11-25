// AI-assisted [AI-02]
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const INVALID_SESSION = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.';

const sendInvalidSession = (res) =>
  res.status(401).json({ status: 'error', code: 'INVALID_SESSION', message: INVALID_SESSION });

// Token còn hạn chưa đủ: tài khoản có thể đã bị khóa hoặc bị xóa sau khi đăng nhập.
// Đọc lại trạng thái trong CSDL ở mọi request để đá người dùng bị khóa ra ngay.
const loadCurrentUser = async (req, res, token, next) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return sendInvalidSession(res);
  }

  let account;
  try {
    account = await userRepository.findAuthStateById(decoded.id);
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái tài khoản:', error);
    return res.status(503).json({
      status: 'error',
      message: 'Không thể xác thực tài khoản lúc này. Vui lòng thử lại sau.'
    });
  }

  if (!account) return sendInvalidSession(res);

  if (Number(account.is_locked) === 1) {
    return res.status(403).json({
      status: 'error',
      code: 'ACCOUNT_LOCKED',
      message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
    });
  }

  // Dùng vai trò mới nhất trong CSDL thay vì vai trò lưu trong token
  req.user = {
    ...decoded,
    id: Number(account.id),
    email: account.email,
    role: account.role,
    mustChangePassword: Number(account.must_change_password) === 1
  };
  return next();
};

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const [scheme, token, ...extraParts] = authHeader.trim().split(/\s+/);
  if (scheme !== 'Bearer' || !token || extraParts.length > 0) {
    return sendInvalidSession(res);
  }

  return loadCurrentUser(req, res, token, next);
};

// 1. Xác thực JWT Token từ Header Authorization
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Định dạng: Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Vui lòng đăng nhập để tiếp tục. Nếu chưa có tài khoản, hãy đăng ký trước.'
    });
  }

  return loadCurrentUser(req, res, token, next);
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

const requirePasswordChanged = (req, res, next) => {
  if (req.user?.role === 'teacher' && req.user.mustChangePassword) {
    return res.status(403).json({
      status: 'error',
      code: 'MUST_CHANGE_PASSWORD',
      message: 'Bạn phải đổi mật khẩu tạm trước khi quản lý khóa học, bài học hoặc câu hỏi.'
    });
  }
  return next();
};

module.exports = { verifyToken, optionalVerifyToken, authorizeRoles, requirePasswordChanged };
