const express = require('express');
const engagementController = require('../controllers/engagementController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const studentsOnly = [verifyToken, authorizeRoles(ROLES.STUDENT)];

router.get('/courses/:courseId/comments', engagementController.listCourseComments);
router.post('/courses/:courseId/comments', ...studentsOnly, engagementController.createCourseComment);
router.get('/lessons/:lessonId/discussions', ...studentsOnly, engagementController.listDiscussions);
router.post('/lessons/:lessonId/discussions', ...studentsOnly, engagementController.createDiscussion);

module.exports = router;
