// AI-assisted [AI-02]
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

// Giới hạn khớp với cột CSDL (VARCHAR 255). bcrypt chỉ dùng 72 byte đầu của mật khẩu,
// nên chặn mật khẩu dài hơn để hai mật khẩu khác nhau không bị coi là một.
const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_BYTES = 72;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isString = (value) => typeof value === 'string';

const register = async ({ name, email, password } = {}) => {
  // 1. Kiểm tra dữ liệu đầu vào phía server (NFR-04, NFR-05) – sai kiểu dữ liệu trả 400, không để lỗi 500
  if (!isString(name) || !isString(email) || !isString(password)) {
    throw createError('Họ tên, email và mật khẩu phải là chuỗi ký tự.', 400);
  }
  const cleanName = name.trim().replace(/\s+/g, ' ');
  if (cleanName.length < 2) {
    throw createError('Trường tên (name) phải có ít nhất 2 ký tự.', 400);
  }
  if (cleanName.length > MAX_NAME_LENGTH) {
    throw createError(`Trường tên (name) tối đa ${MAX_NAME_LENGTH} ký tự.`, 400);
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > MAX_EMAIL_LENGTH) {
    throw createError('Trường email không đúng định dạng hợp lệ.', 400);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw createError(`Trường mật khẩu (password) phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, 400);
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw createError('Mật khẩu quá dài (tối đa 72 ký tự không dấu).', 400);
  }

  // 2. Kiểm tra trùng lặp email
  const existingUser = await userRepository.findByEmail(cleanEmail);
  if (existingUser) {
    throw createError('Email này đã được đăng ký trong hệ thống.', 409);
  }

  // 3. Băm mật khẩu an toàn với bcrypt (NFR-01)
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 4. Ràng buộc đăng ký công khai chỉ tạo tài khoản vai trò 'student'
  const newUser = await userRepository.createUser({
    name: cleanName,
    email: cleanEmail,
    password_hash,
    role: ROLES.STUDENT
  });

  return newUser;
};

const login = async ({ email, password } = {}) => {
  if (!isString(email) || !isString(password) || !email.trim() || !password) {
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
      role: user.role,
      avatar: user.avatar ?? null
    }
  };
};

module.exports = {
  register,
  login
};