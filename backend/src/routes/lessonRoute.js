const express = require('express');
const lessonController = require('../controllers/lessonController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');
const { uploadLessonPdf } = require('../middlewares/pdfUploadMiddleware');

const router = express.Router();
const studentOnly = [verifyToken, authorizeRoles(ROLES.STUDENT)];
const courseManagers = [verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)];

// Danh sách bài học đầy đủ (kèm nội dung, video, PDF) chỉ dành cho người quản lý khóa học.
// Khách / học viên xem tiêu đề bài ở trang chi tiết, nội dung ở /learn sau khi ghi danh.
router.get('/courses/:courseId/lessons', ...courseManagers, lessonController.getCourseLessons);
router.post('/courses/:courseId/lessons', ...courseManagers, lessonController.createLesson);
router.get('/courses/:courseId/learn', ...studentOnly, lessonController.getLearnData);
router.get('/lessons/:lessonId', ...studentOnly, lessonController.getLesson);
router.post('/lessons/:lessonId/complete', ...studentOnly, lessonController.completeLesson);
router.put('/lessons/:lessonId', ...courseManagers, lessonController.updateLesson);
router.delete('/lessons/:lessonId', ...courseManagers, lessonController.deleteLesson);
router.post('/lessons/:lessonId/file', ...courseManagers, uploadLessonPdf, lessonController.uploadLessonFile);
router.get('/lessons/:lessonId/file', verifyToken, lessonController.downloadLessonFile);
router.patch('/lessons/:lessonId/status', ...courseManagers, lessonController.updateLessonStatus);
router.post('/lessons/:lessonId/swap', ...courseManagers, lessonController.swapLessons);

module.exports = router;
