// AI-assisted [AI-15]
/**
 * API Quản lý người dùng (HT-14) – mọi route yêu cầu đăng nhập với vai trò admin.
 */
const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(verifyToken, authorizeRoles(ROLES.ADMIN));

router.get('/', userController.listUsers);              // ?role=all|student|teacher&search=&page=&limit=
router.post('/', userController.createUser);
router.get('/:id', userController.getUserDetail);
router.put('/:id', userController.updateUser);
router.patch('/:id/lock', userController.setLocked);    // body: { locked: true | false }

module.exports = router;
