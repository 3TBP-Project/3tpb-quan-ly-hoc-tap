const express = require('express');
const questionController = require('../controllers/questionController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const courseManagers = [verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)];

router.get('/courses/:courseId/questions', ...courseManagers, questionController.listByCourse);
router.post('/courses/:courseId/questions', ...courseManagers, questionController.createQuestion);
router.put('/questions/:questionId', ...courseManagers, questionController.updateQuestion);
router.delete('/questions/:questionId', ...courseManagers, questionController.deleteQuestion);

module.exports = router;
