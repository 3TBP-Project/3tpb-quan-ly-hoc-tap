// AI-assisted
const express = require('express');
const chapterController = require('../controllers/chapterController');
const { verifyToken, authorizeRoles, requirePasswordChanged } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const courseManagers = [verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)];

// Quản lý chương học (giảng viên sở hữu khóa học / admin).
// Học viên nhận danh sách chương qua /courses/:id (chi tiết) và /courses/:courseId/learn.
router.get('/courses/:courseId/chapters', ...courseManagers, chapterController.listChapters);
router.post('/courses/:courseId/chapters', ...courseManagers, requirePasswordChanged, chapterController.createChapter);
router.put('/chapters/:chapterId', ...courseManagers, requirePasswordChanged, chapterController.renameChapter);
router.post('/chapters/:chapterId/swap', ...courseManagers, requirePasswordChanged, chapterController.swapChapters);
router.delete('/chapters/:chapterId', ...courseManagers, requirePasswordChanged, chapterController.deleteChapter);

module.exports = router;
