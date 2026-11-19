const express = require('express');
const courseController = require('../controllers/courseController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();
const teacherOnly = [verifyToken, authorizeRoles(ROLES.TEACHER)];

router.get('/', courseController.listCourses);
/**
 * Router định nghĩa các API endpoint cho Quản lý khóa học (HT-09)
 */

// Giả định bạn đã có middleware kiểm tra đăng nhập/quyền giảng viên (ví dụ: verifyToken, isTeacher)
// const { verifyToken, isTeacher } = require('../middlewares/authMiddleware');

// ==========================================
// 1. CREATE - Thêm khóa học mới
// ==========================================
router.post('/', ...teacherOnly, courseController.createCourse);

// ==========================================
// 2. READ - Lấy danh sách khóa học của giảng viên đang đăng nhập
// ==========================================
router.get('/my-courses', ...teacherOnly, courseController.getMyCourses);

// ==========================================
// 3. READ - Lấy chi tiết một khóa học theo id
// ==========================================
router.get('/:id', courseController.getCourseDetail);

// ==========================================
// 4. UPDATE - Cập nhật thông tin khóa học
// ==========================================
router.put('/:id', ...teacherOnly, courseController.updateCourse);

// ==========================================
// 5. DELETE - Xóa khóa học
// ==========================================
router.delete('/:id', ...teacherOnly, courseController.deleteCourse);

module.exports = router;
