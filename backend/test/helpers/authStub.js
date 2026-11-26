// Thay thế việc tra trạng thái tài khoản trong CSDL ở authMiddleware cho test route.
// users: { [id]: role } hoặc { [id]: { role, is_locked } }
const userRepository = require('../../src/repositories/userRepository');

module.exports = function stubAuthUsers(users) {
  userRepository.findAuthStateById = async (id) => {
    const entry = users[Number(id)];
    if (!entry) return null;
    const { role, is_locked = 0 } = typeof entry === 'string' ? { role: entry } : entry;
    return { id: Number(id), email: `user${id}@test.local`, role, is_locked };
  };
};
