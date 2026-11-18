// AI-assisted [AI-02]
const authService = require('../services/authService');

const isPlainObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const register = async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu đăng ký không hợp lệ. Vui lòng gửi body định dạng JSON object.'
    });
  }

  try {
    const user = await authService.register(req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản học viên thành công!',
      data: user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi đăng ký tài khoản.'
    });
  }
};

const login = async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu đăng nhập không hợp lệ. Vui lòng gửi body định dạng JSON object.'
    });
  }

  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công!',
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Lỗi hệ thống khi đăng nhập.'
    });
  }
};

module.exports = {
  register,
  login
};