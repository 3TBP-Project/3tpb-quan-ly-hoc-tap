// AI-assisted [AI-06]
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { removeAvatarFile } = require('../middlewares/avatarUploadMiddleware');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

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

// HT-07: học viên chỉ sửa được họ tên; email là định danh đăng nhập nên giữ nguyên
const updateProfile = async (userId, updates) => {
  const current = await getProfile(userId);
  if (typeof updates.name !== 'string') {
    throw createHttpError('Họ tên phải là chuỗi.', 400);
  }

  const name = updates.name.trim();
  if (name.length < 2 || name.length > 255) {
    throw createHttpError('Họ tên phải có từ 2 đến 255 ký tự.', 400);
  }

  return userRepository.updateProfile(userId, { name, email: current.email });
};

// HT-07: đổi ảnh đại diện. Lưu đường dẫn mới rồi mới xóa tệp cũ;
// nếu lưu CSDL thất bại thì xóa tệp vừa tải lên để không để lại rác.
const updateAvatar = async (userId, avatarUrl) => {
  let current;
  try {
    current = await getProfile(userId);
    await userRepository.updateAvatar(userId, avatarUrl);
  } catch (error) {
    removeAvatarFile(avatarUrl);
    throw error;
  }
  if (current.avatar && current.avatar !== avatarUrl) removeAvatarFile(current.avatar);
  return { ...current, avatar: avatarUrl };
};

// HT-07: đổi mật khẩu, bắt buộc nhập đúng mật khẩu hiện tại
const changePassword = async (userId, { currentPassword, newPassword } = {}) => {
  if (typeof currentPassword !== 'string' || currentPassword === '') {
    throw createHttpError('Vui lòng nhập mật khẩu hiện tại.', 400);
  }
  if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw createHttpError(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, 400);
  }

  const account = await userRepository.findPasswordById(userId);
  if (!account) throw createHttpError('Không tìm thấy tài khoản.', 404);

  const isMatch = await bcrypt.compare(currentPassword, account.password);
  if (!isMatch) throw createHttpError('Mật khẩu hiện tại không đúng.', 400);

  if (await bcrypt.compare(newPassword, account.password)) {
    throw createHttpError('Mật khẩu mới phải khác mật khẩu hiện tại.', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.updatePassword(userId, passwordHash);
};

const getMyCourses = (userId) => userRepository.listEnrolledCourses(userId);

const toTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

// HT-07: gom lịch sử làm bài theo khóa học, đánh số lượt và tính điểm cao nhất
const getMyQuizzes = async (userId) => {
  const rows = await userRepository.listQuizHistory(userId);
  const submitted = rows
    .filter((row) => row.submittedAt && row.score !== null)
    .sort((a, b) => (toTime(a.startedAt) ?? 0) - (toTime(b.startedAt) ?? 0) || a.attemptId - b.attemptId);

  const groups = new Map();
  for (const row of submitted) {
    if (!groups.has(row.courseId)) {
      groups.set(row.courseId, { courseId: row.courseId, courseTitle: row.courseTitle, attempts: [] });
    }
    const group = groups.get(row.courseId);
    const started = toTime(row.startedAt);
    const finished = toTime(row.submittedAt);
    group.attempts.push({
      attemptId: row.attemptId,
      attemptNumber: group.attempts.length + 1,
      score: row.score,
      startedAt: row.startedAt,
      submittedAt: row.submittedAt,
      durationMinutes: started !== null && finished !== null
        ? Math.max(1, Math.round((finished - started) / 60000))
        : null
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      bestScore: Math.max(...group.attempts.map((attempt) => attempt.score))
    }))
    .sort((a, b) => {
      const lastA = toTime(a.attempts.at(-1).submittedAt) ?? 0;
      const lastB = toTime(b.attempts.at(-1).submittedAt) ?? 0;
      return lastB - lastA;
    });
};

module.exports = { getProfile, updateProfile, updateAvatar, changePassword, getMyCourses, getMyQuizzes };
