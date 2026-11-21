const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');
const { uploadAvatar } = require('../middlewares/avatarUploadMiddleware');

const router = express.Router();

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.patch('/me/avatar', verifyToken, uploadAvatar, userController.updateAvatar);
router.put('/password', verifyToken, userController.changePassword);
router.get('/my-courses', verifyToken, authorizeRoles(ROLES.STUDENT), userController.getMyCourses);
router.get('/my-quizzes', verifyToken, authorizeRoles(ROLES.STUDENT), userController.getMyQuizzes);

module.exports = router;
