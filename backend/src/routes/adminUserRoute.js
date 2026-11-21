// AI-assisted [AI-08]
// HT-14: API Quản lý người dùng – chỉ quản trị viên
const express = require('express');
const adminUserController = require('../controllers/adminUserController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(verifyToken, authorizeRoles(ROLES.ADMIN));

router.get('/', adminUserController.listUsers);
router.post('/', adminUserController.createTeacher);
router.put('/:id', adminUserController.updateUser);
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
