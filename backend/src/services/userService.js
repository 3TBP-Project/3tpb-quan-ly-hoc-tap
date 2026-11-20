const userRepository = require('../repositories/userRepository');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getProfile = async (userId) => {
  const profile = await userRepository.findProfileById(userId);
  if (!profile) throw createHttpError('Không tìm thấy tài khoản.', 404);
  return profile;
};

const updateProfile = async (userId, updates) => {
  const current = await getProfile(userId);
  if (updates.name !== undefined && typeof updates.name !== 'string') {
    throw createHttpError('Tên phải là chuỗi.', 400);
  }
  if (updates.email !== undefined && typeof updates.email !== 'string') {
    throw createHttpError('Email phải là chuỗi.', 400);
  }

  const name = updates.name === undefined ? current.name : updates.name.trim();
  const email = updates.email === undefined ? current.email : updates.email.trim().toLowerCase();

  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 255) {
    throw createHttpError('Tên phải có từ 2 đến 255 ký tự.', 400);
  }
  if (
    typeof email !== 'string' ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw createHttpError('Email không đúng định dạng.', 400);
  }

  return userRepository.updateProfile(userId, { name, email });
};

const getMyCourses = (userId) => userRepository.listEnrolledCourses(userId);
const getMyQuizzes = (userId) => userRepository.listQuizHistory(userId);

module.exports = { getProfile, updateProfile, getMyCourses, getMyQuizzes };
