const express = require('express');
const lessonController = require('../controllers/lessonController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const studentOnly = [verifyToken, authorizeRoles(ROLES.STUDENT)];
const courseManagers = [verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)];

router.get('/courses/:courseId/lessons', lessonController.getCourseLessons);
router.post('/courses/:courseId/lessons', ...courseManagers, lessonController.createLesson);
router.get('/courses/:courseId/learn', ...studentOnly, lessonController.getLearnData);
router.get('/lessons/:lessonId', ...studentOnly, lessonController.getLesson);
router.post('/lessons/:lessonId/complete', ...studentOnly, lessonController.completeLesson);
router.put('/lessons/:lessonId', ...courseManagers, lessonController.updateLesson);
router.delete('/lessons/:lessonId', ...courseManagers, lessonController.deleteLesson);

module.exports = router;
