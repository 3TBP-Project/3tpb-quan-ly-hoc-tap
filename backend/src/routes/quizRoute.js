// AI-assisted [AI-04]
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

// Chỉ học viên đã đăng nhập mới được bắt đầu và nộp bài trắc nghiệm
router.post('/courses/:courseId/start', verifyToken, authorizeRoles(ROLES.STUDENT), quizController.startQuiz);
router.post('/attempts/:attemptId/submit', verifyToken, authorizeRoles(ROLES.STUDENT), quizController.submitQuiz);

module.exports = router;