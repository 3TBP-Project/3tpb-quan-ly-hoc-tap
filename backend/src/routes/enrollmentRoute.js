const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(verifyToken, authorizeRoles(ROLES.STUDENT));
router.post('/courses/:courseId', enrollmentController.enroll);
router.get('/my-courses', enrollmentController.getMyCourses);

module.exports = router;
