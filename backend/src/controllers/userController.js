// AI-assisted [AI-15]
/**
 * Controller Quản lý người dùng (HT-14)
 */
const userService = require('../services/userService');
const { toPublicError } = require('../utils/errorResponse');

const ROLE_FILTERS = ['student', 'teacher'];

const parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const sendError = (res, error, fallbackMessage, context) => {
  const { statusCode, message } = toPublicError(error, fallbackMessage, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const requireJsonBody = (req, res) => {
  if (isPlainObject(req.body)) return true;
  res.status(400).json({ status: 'error', message: 'Dữ liệu gửi lên phải là JSON object.' });
  return false;
};

const listUsers = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10);
  const { role = 'all', search = '' } = req.query;

  if (!page || !limit || limit > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Tham số page và limit phải là số nguyên dương; limit tối đa là 100.'
    });
  }
  if (typeof role !== 'string' || (role !== 'all' && !ROLE_FILTERS.includes(role)) || typeof search !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Tham số role hoặc search không hợp lệ.' });
  }

  try {
    const result = await userService.listUsers({
      role: role === 'all' ? null : role,
      search: search.trim(),
      page,
      limit
    });
    return res.status(200).json({ status: 'success', data: result.users, counts: result.counts, pagination: result.pagination });
  } catch (error) {
    return sendError(res, error, 'Không thể tải danh sách người dùng.', 'Lỗi khi tải danh sách người dùng:');
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await userService.getUserDetail(req.params.id);
    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    return sendError(res, error, 'Không thể tải hồ sơ người dùng.', 'Lỗi khi tải hồ sơ người dùng:');
  }
};

const createUser = async (req, res) => {
  if (!requireJsonBody(req, res)) return;
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json({ status: 'success', message: 'Thêm người dùng thành công!', data: user });
  } catch (error) {
    return sendError(res, error, 'Không thể thêm người dùng lúc này.', 'Lỗi khi thêm người dùng:');
  }
};

const updateUser = async (req, res) => {
  if (!requireJsonBody(req, res)) return;
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json({ status: 'success', message: 'Cập nhật người dùng thành công!', data: user });
  } catch (error) {
    return sendError(res, error, 'Không thể cập nhật người dùng lúc này.', 'Lỗi khi cập nhật người dùng:');
  }
};

const setLocked = async (req, res) => {
  if (!requireJsonBody(req, res)) return;
  try {
    const user = await userService.setLocked(req.params.id, req.body.locked);
    return res.status(200).json({
      status: 'success',
      message: user.status === 'locked' ? 'Đã chặn tài khoản.' : 'Đã bỏ chặn tài khoản.',
      data: user
    });
  } catch (error) {
    return sendError(res, error, 'Không thể đổi trạng thái tài khoản lúc này.', 'Lỗi khi chặn/bỏ chặn tài khoản:');
  }
};

module.exports = { listUsers, getUserDetail, createUser, updateUser, setLocked };
