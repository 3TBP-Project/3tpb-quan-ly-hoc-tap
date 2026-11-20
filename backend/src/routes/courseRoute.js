const express = require('express');
const courseController = require('../controllers/courseController');
/**
 * Router định nghĩa các API endpoint cho Quản lý khóa học (HT-09)
 */
const enrollmentController = require('../controllers/enrollmentController');
const {
  verifyToken,
  optionalVerifyToken,
  authorizeRoles
} = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const courseManagers = [
  verifyToken,
  authorizeRoles(ROLES.TEACHER, ROLES.ADMIN)
];
const studentsOnly = [verifyToken, authorizeRoles(ROLES.STUDENT)];

router.get('/', courseController.listCourses);
/**
 * Router định nghĩa các API endpoint cho Quản lý khóa học (HT-09)
 */

// ==========================================
// 1. CREATE - Thêm khóa học mới (Yêu cầu đăng nhập & đúng vai trò Giảng viên/Admin)
// ==========================================
router.post('/', ...courseManagers, courseController.createCourse);

// ==========================================
// 2. READ - Lấy danh sách khóa học của giảng viên đang đăng nhập
// ==========================================
router.get('/my-courses', ...courseManagers, courseController.getMyCourses);

router.post('/:courseId/enroll', ...studentsOnly, enrollmentController.enroll);

// ==========================================
// 3. READ - Lấy chi tiết một khóa học theo id (Route công khai cho mọi người xem)
// ==========================================
router.get('/:id', optionalVerifyToken, courseController.getCourseDetail);

// ==========================================
// 4. UPDATE - Cập nhật thông tin khóa học (Yêu cầu đăng nhập & kiểm tra quyền sở hữu ở service)
// ==========================================
router.put('/:id', ...courseManagers, courseController.updateCourse);

// ==========================================
// 5. DELETE - Xóa khóa học (Yêu cầu đăng nhập & kiểm tra quyền)
// ==========================================
router.delete('/:id', ...courseManagers, courseController.deleteCourse);

module.exports = router;
//AI-assisted: <Gemini> [AI-04]
