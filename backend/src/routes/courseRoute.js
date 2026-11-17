const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

router.get('/', courseController.listCourses);
/**
 * Router định nghĩa các API endpoint cho Quản lý khóa học (HT-09)
 */

// Giả định bạn đã có middleware kiểm tra đăng nhập/quyền giảng viên (ví dụ: verifyToken, isTeacher)
// const { verifyToken, isTeacher } = require('../middlewares/authMiddleware');

// ==========================================
// 1. CREATE - Thêm khóa học mới
// ==========================================
// router.post('/', verifyToken, isTeacher, courseController.createCourse);
router.post('/', courseController.createCourse);

// ==========================================
// 2. READ - Lấy danh sách khóa học của giảng viên đang đăng nhập
// ==========================================
// router.get('/my-courses', verifyToken, isTeacher, courseController.getMyCourses);
router.get('/my-courses', courseController.getMyCourses);

// ==========================================
// 3. READ - Lấy chi tiết một khóa học theo id
// ==========================================
router.get('/:id', courseController.getCourseDetail);

// ==========================================
// 4. UPDATE - Cập nhật thông tin khóa học
// ==========================================
// router.put('/:id', verifyToken, isTeacher, courseController.updateCourse);
router.put('/:id', courseController.updateCourse);

// ==========================================
// 5. DELETE - Xóa khóa học
// ==========================================
// router.delete('/:id', verifyToken, isTeacher, courseController.deleteCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
