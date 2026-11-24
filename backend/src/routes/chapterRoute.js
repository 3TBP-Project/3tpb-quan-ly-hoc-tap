// AI-assisted
const express = require('express');
const chapterController = require('../controllers/chapterController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const courseManagers = [verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)];

// Quản lý chương học (giảng viên sở hữu khóa học / admin).
// Học viên nhận danh sách chương qua /courses/:id (chi tiết) và /courses/:courseId/learn.
router.get('/courses/:courseId/chapters', ...courseManagers, chapterController.listChapters);
router.post('/courses/:courseId/chapters', ...courseManagers, chapterController.createChapter);
router.put('/chapters/:chapterId', ...courseManagers, chapterController.renameChapter);
router.post('/chapters/:chapterId/swap', ...courseManagers, chapterController.swapChapters);
router.delete('/chapters/:chapterId', ...courseManagers, chapterController.deleteChapter);

module.exports = router;
