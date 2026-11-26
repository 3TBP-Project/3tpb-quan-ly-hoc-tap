// AI-assisted [AI-13]
const express = require('express');
const questionController = require('../controllers/questionController');
const { verifyToken, authorizeRoles, requirePasswordChanged } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const teacherOnly = [verifyToken, authorizeRoles(ROLES.TEACHER)];
const courseManagers = [verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)];

// Routes quản lý câu hỏi cho Giảng viên (HT-11 - mount dưới /api/teacher)
router.get('/courses', ...teacherOnly, questionController.getTeacherCourses);
router.put('/courses/:courseId/quiz-duration', ...teacherOnly, requirePasswordChanged, questionController.updateQuizDuration);
router.get('/courses/:courseId/questions', ...courseManagers, questionController.getCourseQuestionsOrList);
router.post('/courses/:courseId/questions', ...courseManagers, requirePasswordChanged, questionController.createQuestion);
router.put('/courses/:courseId/questions/:questionId', ...teacherOnly, requirePasswordChanged, questionController.updateQuestion);
router.delete('/courses/:courseId/questions/:questionId', ...teacherOnly, requirePasswordChanged, questionController.deleteQuestion);

// Routes CRUD câu hỏi theo chuẩn REST (develop - mount dưới /api)
router.put('/questions/:questionId', ...courseManagers, questionController.updateQuestion);
router.delete('/questions/:questionId', ...courseManagers, questionController.deleteQuestion);

module.exports = router;