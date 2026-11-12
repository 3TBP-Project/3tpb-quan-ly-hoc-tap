const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { ROLES } = require('../config/constants');

const SALT_ROUNDS = 10;

// Hàm tiện ích tạo lỗi kèm HTTP Status Code
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const register = async ({ name, email, password }) => {
  // 1. Kiểm tra dữ liệu đầu vào phía server (NFR-04, NFR-05)
  if (!name || name.trim().length < 2) {
    throw createError('Trường tên (name) phải có ít nhất 2 ký tự.', 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw createError('Trường email không đúng định dạng hợp lệ.', 400);
  }
  if (!password || password.length < 6) {
    throw createError('Trường mật khẩu (password) phải có ít nhất 6 ký tự.', 400);
  }

  // 2. Kiểm tra trùng lặp email
  const existingUser = await userRepository.findByEmail(email.trim().toLowerCase());
  if (existingUser) {
    throw createError('Email này đã được đăng ký trong hệ thống.', 409);
  }

  // 3. Băm mật khẩu an toàn với bcrypt (NFR-01)
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 4. Ràng buộc đăng ký công khai chỉ tạo tài khoản vai trò 'student'
  const newUser = await userRepository.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password_hash,
    role: ROLES.STUDENT
  });

  return newUser;
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw createError('Vui lòng nhập đầy đủ trường email và mật khẩu.', 400);
  }

  // 1. Tìm người dùng theo email
  const user = await userRepository.findByEmail(email.trim().toLowerCase());
  if (!user) {
    throw createError('Email hoặc mật khẩu không chính xác.', 401);
  }

  // 2. Chặn tài khoản đang bị khóa
  if (user.is_locked === 1) {
    throw createError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
  }

  // 3. Đối chiếu mật khẩu nhập vào với chuỗi băm trong cột 'password'
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw createError('Email hoặc mật khẩu không chính xác.', 401);
  }

  // 4. Cấp JWT Token chứa id, email và role
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // 5. Xác định đường dẫn điều hướng sau đăng nhập theo 3 vai trò
  const redirectMap = {
    [ROLES.ADMIN]: '/admin/dashboard',
    [ROLES.TEACHER]: '/teacher/dashboard',
    [ROLES.STUDENT]: '/student/dashboard'
  };

  return {
    token,
    redirectUrl: redirectMap[user.role] || '/student/dashboard',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = {
  register,
  login
};