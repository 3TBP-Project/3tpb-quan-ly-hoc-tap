// AI-assisted [AI-08]
const adminUserService = require('../services/adminUserService');
const { toPublicError } = require('../utils/errorResponse');

const handleError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

// GET /api/admin/users?role=all|student|teacher&search=&page=&limit=
const listUsers = async (req, res) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
  if (
    !Number.isSafeInteger(page) || page < 1 ||
    !Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'page phải là số nguyên dương; limit từ 1 đến 100.'
    });
  }

  try {
    const data = await adminUserService.listUsers({
      page,
      limit,
      role: req.query.role ?? 'all',
      search: req.query.search ?? ''
    });
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải danh sách người dùng.', 'Lỗi khi tải người dùng:');
  }
};

// POST /api/admin/users – tạo tài khoản giảng viên
const createTeacher = async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ status: 'error', message: 'Dữ liệu tài khoản không hợp lệ.' });
  }
  try {
    const data = await adminUserService.createTeacher(req.body);
    return res.status(201).json({ status: 'success', message: 'Đã thêm giảng viên.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể thêm giảng viên.', 'Lỗi khi thêm giảng viên:');
  }
};

// PUT /api/admin/users/:id – body { name } để sửa họ tên, hoặc { is_locked } để chặn / bỏ chặn
const updateUser = async (req, res) => {
  const body = req.body;
  const keys = isPlainObject(body) ? Object.keys(body) : [];
  const validLock = keys.length === 1 && keys[0] === 'is_locked' && typeof body.is_locked === 'boolean';
  const validName = keys.length === 1 && keys[0] === 'name';
  if (!validLock && !validName) {
    return res.status(400).json({
      status: 'error',
      message: 'Chỉ gửi một trong hai trường: name (chuỗi) hoặc is_locked (boolean).'
    });
  }

  try {
    const data = validLock
      ? await adminUserService.setLocked(req.params.id, req.user.id, body.is_locked)
      : await adminUserService.updateName(req.params.id, body.name);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể cập nhật tài khoản.', 'Lỗi khi cập nhật tài khoản:');
  }
};

const deleteUser = async (req, res) => {
  try {
    await adminUserService.deleteUser(req.params.id, req.user.id);
    return res.status(200).json({ status: 'success', message: 'Đã xóa tài khoản.' });
  } catch (error) {
    return handleError(res, error, 'Không thể xóa tài khoản.', 'Lỗi khi xóa tài khoản:');
  }
};

module.exports = { listUsers, createTeacher, updateUser, deleteUser };
