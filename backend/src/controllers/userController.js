// AI-assisted [AI-06]
const userService = require('../services/userService');
const { toPublicError } = require('../utils/errorResponse');

const isPlainObject = (value) => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const handleError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const getProfile = async (req, res) => {
  try {
    const data = await userService.getProfile(req.user.id);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải hồ sơ lúc này.', 'Lỗi khi tải hồ sơ:');
  }
};

const updateProfile = async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ status: 'error', message: 'Dữ liệu hồ sơ không hợp lệ.' });
  }
  const keys = Object.keys(req.body);
  if (keys.length !== 1 || keys[0] !== 'name') {
    return res.status(400).json({
      status: 'error',
      message: 'Chỉ được cập nhật họ tên (name). Email dùng để đăng nhập nên không thể thay đổi.'
    });
  }

  try {
    const data = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ status: 'success', message: 'Cập nhật hồ sơ thành công.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể cập nhật hồ sơ lúc này.', 'Lỗi khi cập nhật hồ sơ:');
  }
};

// HT-07: đổi ảnh đại diện (tệp đã được avatarUploadMiddleware kiểm tra và lưu)
const updateAvatar = async (req, res) => {
  try {
    const data = await userService.updateAvatar(req.user.id, req.avatarUrl);
    return res.status(200).json({ status: 'success', message: 'Đổi ảnh đại diện thành công.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể đổi ảnh đại diện lúc này.', 'Lỗi khi đổi ảnh đại diện:');
  }
};

// HT-07: đổi mật khẩu
const changePassword = async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ status: 'error', message: 'Dữ liệu đổi mật khẩu không hợp lệ.' });
  }

  try {
    await userService.changePassword(req.user.id, req.body);
    return res.status(200).json({ status: 'success', message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    return handleError(res, error, 'Không thể đổi mật khẩu lúc này.', 'Lỗi khi đổi mật khẩu:');
  }
};

const getMyCourses = async (req, res) => {
  try {
    const data = await userService.getMyCourses(req.user.id);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải khóa học đã ghi danh.', 'Lỗi khi tải khóa học của học viên:');
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const data = await userService.getMyQuizzes(req.user.id);
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải lịch sử trắc nghiệm.', 'Lỗi khi tải lịch sử trắc nghiệm:');
  }
};

module.exports = { getProfile, updateProfile, updateAvatar, changePassword, getMyCourses, getMyQuizzes };
