// AI-assisted [AI-13]
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

// Tất cả API quản lý câu hỏi yêu cầu đăng nhập với vai trò Giảng viên
router.use(verifyToken, authorizeRoles(ROLES.TEACHER));

router.get('/courses', questionController.getTeacherCourses);
router.put('/courses/:courseId/quiz-duration', questionController.updateQuizDuration);
router.get('/courses/:courseId/questions', questionController.getCourseQuestions);
router.post('/courses/:courseId/questions', questionController.createQuestion);
router.put('/courses/:courseId/questions/:questionId', questionController.updateQuestion);
router.delete('/courses/:courseId/questions/:questionId', questionController.deleteQuestion);

module.exports = router;