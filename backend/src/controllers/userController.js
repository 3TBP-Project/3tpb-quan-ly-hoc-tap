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
  if (keys.length === 0 || keys.some((key) => !['name', 'email'].includes(key))) {
    return res.status(400).json({
      status: 'error',
      message: 'Chỉ được cập nhật các trường name và email.'
    });
  }

  try {
    const data = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ status: 'success', message: 'Cập nhật hồ sơ thành công.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể cập nhật hồ sơ lúc này.', 'Lỗi khi cập nhật hồ sơ:');
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

module.exports = { getProfile, updateProfile, getMyCourses, getMyQuizzes };
