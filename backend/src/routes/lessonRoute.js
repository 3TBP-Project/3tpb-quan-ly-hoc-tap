const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');
const { validateYouTubeVideo } = require('../middlewares/youtubeMiddleware');
const { uploadLessonPdf } = require('../middlewares/pdfUploadMiddleware');

router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.TEACHER, ROLES.ADMIN),
  uploadLessonPdf,
  validateYouTubeVideo,
  lessonController.createLesson
);

router.put(
  '/reorder',
  verifyToken,
  authorizeRoles(ROLES.TEACHER, ROLES.ADMIN),
  lessonController.reorderLessons
);

router.get('/course/:courseId', lessonController.getLessonsByCourse);
router.get('/:id', lessonController.getLessonDetail);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.TEACHER, ROLES.ADMIN),
  uploadLessonPdf,
  validateYouTubeVideo,
  lessonController.updateLesson
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.TEACHER, ROLES.ADMIN),
  lessonController.deleteLesson
);

module.exports = router;
//AI-assisted: <Gemini> [AI-05]