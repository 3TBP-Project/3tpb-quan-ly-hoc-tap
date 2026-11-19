// AI-assisted [AI-15]
/**
 * Service nghiệp vụ Quản lý người dùng (HT-14) – chỉ dành cho quản trị viên.
 */
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Chuẩn hóa bản ghi CSDL thành dữ liệu trả cho client (không bao giờ có mật khẩu)
const toPublicUser = (row) => ({
  id: row.id,
  avatar: row.avatar ?? null,
  name: row.name,
  email: row.email,
  role: row.role,
  courses: Number(row.courses ?? 0),
  status: Number(row.is_locked) === 1 ? 'locked' : 'active',
  createdAt: row.created_at ?? null
});

const parseId = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw createError('Mã người dùng không hợp lệ.', 400);
  return id;
};

// Kiểm tra dữ liệu form tạo / sửa người dùng
const validateUserInput = ({ name, email, role, password }, { requirePassword }) => {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (cleanName.length < 2 || cleanName.length > 255) {
    throw createError('Họ tên phải có từ 2 đến 255 ký tự.');
  }
  if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
    throw createError('Email không đúng định dạng hợp lệ.');
  }
  if (!userRepository.MANAGED_ROLES.includes(role)) {
    throw createError('Vai trò chỉ được là học viên (student) hoặc giảng viên (teacher).');
  }

  const hasPassword = password !== undefined && password !== null && password !== '';
  if (requirePassword || hasPassword) {
    if (typeof password !== 'string' || password.length < 6) {
      throw createError('Mật khẩu phải có ít nhất 6 ký tự.');
    }
  }

  return { name: cleanName, email: cleanEmail, role, password: hasPassword ? password : null };
};

// Lấy người dùng thuộc phạm vi quản lý (học viên/giảng viên); admin coi như không tồn tại
const getManagedUser = async (id) => {
  const user = await userRepository.findPublicById(id);
  if (!user || !userRepository.MANAGED_ROLES.includes(user.role)) {
    throw createError('Không tìm thấy người dùng.', 404);
  }
  return user;
};

const listUsers = async ({ role, search, page, limit }) => {
  const [{ users, total }, counts] = await Promise.all([
    userRepository.findPage({ role, search, page, limit }),
    userRepository.countByRole()
  ]);

  return {
    users: users.map(toPublicUser),
    counts,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
  };
};

const getUserDetail = async (rawId) => {
  const user = await getManagedUser(parseId(rawId));
  const courseList = await userRepository.findCoursesOfUser(user);
  return { ...toPublicUser(user), courseList };
};

const createUser = async (input) => {
  const data = validateUserInput(input, { requirePassword: true });

  if (await userRepository.findByEmail(data.email)) {
    throw createError('Email này đã được đăng ký trong hệ thống.', 409);
  }

  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const created = await userRepository.createUser({ ...data, password_hash });
  return toPublicUser(await userRepository.findPublicById(created.id));
};

const updateUser = async (rawId, input) => {
  const id = parseId(rawId);
  await getManagedUser(id);
  const data = validateUserInput(input, { requirePassword: false });

  const sameEmail = await userRepository.findByEmail(data.email);
  if (sameEmail && sameEmail.id !== id) {
    throw createError('Email này đã được dùng cho tài khoản khác.', 409);
  }

  const password_hash = data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : null;
  await userRepository.updateUser(id, { ...data, password_hash });
  return toPublicUser(await userRepository.findPublicById(id));
};

const setLocked = async (rawId, locked) => {
  if (typeof locked !== 'boolean') {
    throw createError('Trường locked phải là true hoặc false.');
  }
  const id = parseId(rawId);
  await getManagedUser(id);
  await userRepository.setLocked(id, locked);
  return toPublicUser(await userRepository.findPublicById(id));
};

module.exports = {
  toPublicUser,
  listUsers,
  getUserDetail,
  createUser,
  updateUser,
  setLocked
};
