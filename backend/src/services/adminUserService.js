const userRepository = require('../repositories/userRepository');

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

const listUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await userRepository.listUsers({ limit, offset });
  return {
    ...result,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    }
  };
};

const setLocked = async (targetId, actorId, isLocked) => {
  const userId = parsePositiveId(targetId);
  if (!userId) throw createHttpError('ID người dùng không hợp lệ.', 400);
  if (userId === actorId && isLocked) {
    throw createHttpError('Không thể tự khóa tài khoản quản trị đang sử dụng.', 400);
  }
  const updated = await userRepository.setUserLocked(userId, isLocked);
  if (!updated) throw createHttpError('Không tìm thấy tài khoản.', 404);
  return { id: userId, isLocked };
};

const deleteUser = async (targetId, actorId) => {
  const userId = parsePositiveId(targetId);
  if (!userId) throw createHttpError('ID người dùng không hợp lệ.', 400);
  if (userId === actorId) {
    throw createHttpError('Không thể xóa tài khoản quản trị đang sử dụng.', 400);
  }
  const deleted = await userRepository.deleteUser(userId);
  if (!deleted) throw createHttpError('Không tìm thấy tài khoản.', 404);
};

module.exports = { listUsers, setLocked, deleteUser };
