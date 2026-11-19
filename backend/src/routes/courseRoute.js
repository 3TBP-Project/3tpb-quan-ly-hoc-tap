const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

router.get('/', courseController.listCourses);
/**
 * Router định nghĩa các API endpoint cho Quản lý khóa học (HT-09)
 */

// Import middleware xác thực và phân quyền từ hệ thống
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');

// ==========================================
// 1. CREATE - Thêm khóa học mới (Yêu cầu đăng nhập & đúng vai trò Giảng viên/Admin)
// ==========================================
router.post('/', verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN), courseController.createCourse);

// ==========================================
// 2. READ - Lấy danh sách khóa học của giảng viên đang đăng nhập
// ==========================================
router.get('/my-courses', verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN), courseController.getMyCourses);

// ==========================================
// 3. READ - Lấy chi tiết một khóa học theo id (Route công khai cho mọi người xem)
// ==========================================
router.get('/:id', courseController.getCourseDetail);

// ==========================================
// 4. UPDATE - Cập nhật thông tin khóa học (Yêu cầu đăng nhập & kiểm tra quyền sở hữu ở service)
// ==========================================
router.put('/:id', verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN), courseController.updateCourse);

// ==========================================
// 5. DELETE - Xóa khóa học (Yêu cầu đăng nhập & kiểm tra quyền)
// ==========================================
router.delete('/:id', verifyToken, authorizeRoles(ROLES.TEACHER, ROLES.ADMIN), courseController.deleteCourse);

module.exports = router;
//AI-assisted: <Gemini> [AI-04]
