// AI-assisted [AI-08]
// HT-14: Quản lý người dùng – chỉ quản trị viên
const bcrypt = require('bcrypt');
const adminUserRepository = require('../repositories/adminUserRepository');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_FILTERS = ['all', 'student', 'teacher'];

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parsePositiveId = (value) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const requireId = (value) => {
  const id = parsePositiveId(value);
  if (!id) throw createHttpError('ID người dùng không hợp lệ.', 400);
  return id;
};

const validateName = (name) => {
  const clean = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';
  if (clean.length < 2 || clean.length > 255) {
    throw createHttpError('Họ tên phải có từ 2 đến 255 ký tự.', 400);
  }
  return clean;
};

// Quản trị viên chỉ quản lý học viên và giảng viên; tài khoản admin coi như không tồn tại
const getManagedUser = async (id) => {
  const user = await adminUserRepository.findById(id);
  if (!user || !adminUserRepository.MANAGED_ROLES.includes(user.role)) {
    throw createHttpError('Không tìm thấy tài khoản.', 404);
  }
  return user;
};

const listUsers = async ({ page = 1, limit = 10, role = 'all', search = '' } = {}) => {
  if (!ROLE_FILTERS.includes(role)) {
    throw createHttpError('Vai trò lọc chỉ được là all, student hoặc teacher.', 400);
  }
  const keyword = typeof search === 'string' ? search.trim().slice(0, 255) : '';
  const [{ users, total }, counts] = await Promise.all([
    adminUserRepository.findPage({ role, search: keyword, page, limit }),
    adminUserRepository.countByRole()
  ]);
  return {
    users,
    total,
    counts,
    pagination: { page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) }
  };
};

// Tạo tài khoản giảng viên (vai trò Giảng viên, trạng thái Hoạt động)
const createTeacher = async ({ name, email, password } = {}) => {
  const cleanName = validateName(name);
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanEmail) throw createHttpError('Email không được để trống.', 400);
  if (cleanEmail.length > 255 || !EMAIL_REGEX.test(cleanEmail)) {
    throw createHttpError('Email không hợp lệ.', 400);
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw createHttpError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, 400);
  }
  if (await adminUserRepository.findByEmail(cleanEmail)) {
    throw createHttpError('Email này đã được sử dụng.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await adminUserRepository.createTeacher({ name: cleanName, email: cleanEmail, passwordHash });
  return adminUserRepository.findById(id);
};

// Sửa họ tên (email là định danh đăng nhập nên không sửa)
const updateName = async (targetId, name) => {
  const id = requireId(targetId);
  const cleanName = validateName(name);
  await getManagedUser(id);
  await adminUserRepository.updateName(id, cleanName);
  return adminUserRepository.findById(id);
};

const setLocked = async (targetId, actorId, isLocked) => {
  const userId = requireId(targetId);
  if (userId === actorId && isLocked) {
    throw createHttpError('Không thể tự khóa tài khoản quản trị đang sử dụng.', 400);
  }
  await getManagedUser(userId);
  await adminUserRepository.setLocked(userId, isLocked);
  return adminUserRepository.findById(userId);
};

// Xóa học viên hoặc giảng viên; giảng viên phải chưa có khóa học (tránh xóa dây chuyền khóa học)
const deleteUser = async (targetId, actorId) => {
  const userId = requireId(targetId);
  if (userId === actorId) {
    throw createHttpError('Không thể xóa tài khoản quản trị đang sử dụng.', 400);
  }
  const user = await getManagedUser(userId);

  if (user.role === 'student') {
    const deleted = await adminUserRepository.deleteStudent(userId);
    if (!deleted) throw createHttpError('Không tìm thấy tài khoản.', 404);
    return user;
  }

  if (user.courses > 0) {
    throw createHttpError(
      `Giảng viên ${user.name} đang có ${user.courses} khóa học nên không thể xóa. Hãy chặn tài khoản thay vì xóa.`,
      409
    );
  }
  const deleted = await adminUserRepository.deleteTeacherWithoutCourses(userId);
  if (!deleted) throw createHttpError('Giảng viên vừa có khóa học mới, không thể xóa.', 409);
  return user;
};

module.exports = { listUsers, createTeacher, updateName, setLocked, deleteUser };
