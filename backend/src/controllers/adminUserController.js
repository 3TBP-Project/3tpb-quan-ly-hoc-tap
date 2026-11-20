const adminUserService = require('../services/adminUserService');
const { toPublicError } = require('../utils/errorResponse');

const handleError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const listUsers = async (req, res) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);
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
    const data = await adminUserService.listUsers(page, limit);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải danh sách người dùng.', 'Lỗi khi tải người dùng:');
  }
};

const updateUser = async (req, res) => {
  if (!req.body || typeof req.body.is_locked !== 'boolean' ||
      Object.keys(req.body).some((key) => key !== 'is_locked')) {
    return res.status(400).json({
      status: 'error',
      message: 'Trường is_locked phải là boolean.'
    });
  }

  try {
    const data = await adminUserService.setLocked(req.params.id, req.user.id, req.body.is_locked);
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

module.exports = { listUsers, updateUser, deleteUser };
