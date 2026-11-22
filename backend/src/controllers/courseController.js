// AI-assisted [AI-05]
const courseRepository = require('../repositories/courseRepository');
const courseService = require('../services/courseService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const parseOptionalPositiveInteger = (value) => {
  if (value === undefined || value === '') return undefined;
  return parsePositiveInteger(value, null);
};

const listCourses = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 9);
  const categoryId = parseOptionalPositiveInteger(req.query.categoryId);
  const teacherId = parseOptionalPositiveInteger(req.query.teacherId);
  const rawSearch = req.query.search;
  const search = typeof rawSearch === 'string' ? rawSearch.trim() : '';

  if (!page || !limit || limit > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Tham số page và limit phải là số nguyên dương; limit tối đa là 100.'
    });
  }

  if (
    categoryId === null ||
    teacherId === null ||
    (rawSearch !== undefined && typeof rawSearch !== 'string')
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Tham số search, categoryId hoặc teacherId không hợp lệ.'
    });
  }

  try {
    const filters = {};
    if (search) filters.search = search;
    if (categoryId !== undefined) filters.categoryId = categoryId;
    if (teacherId !== undefined) filters.teacherId = teacherId;

    const { courses, total } = await courseRepository.findPage({ page, limit, ...filters });

    return res.status(200).json({
      status: 'success',
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi tải danh sách khóa học:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách khóa học.'
    });
  }
};

/**
 * Controller tiếp nhận request/response cho quản lý khóa học (HT-09)
 */

class CourseController {

  // ==========================================
  // 1. CREATE - Thêm khóa học mới
  // ==========================================
  async createCourse(req, res) {
    try {
      // Lấy userId từ middleware xác thực (ví dụ: req.user.id hoặc req.userId)
      const userId = req.user ? req.user.id : req.userId;
      const courseData = req.body;

      const newCourse = await courseService.createCourse(userId, courseData);
      return res.status(201).json({
        success: true,
        message: 'Tạo khóa học thành công!',
        data: newCourse
      });
    } catch (error) {
      const { statusCode, message } = toPublicError(
        error,
        'Không thể tạo khóa học lúc này.',
        'Lỗi khi tạo khóa học:'
      );
      return res.status(statusCode).json({
        success: false,
        message
      });
    }
  }

  // ==========================================
  // 2. READ - Lấy danh sách khóa học của giảng viên đang đăng nhập
  // ==========================================
  async getMyCourses(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const courses = await courseService.getCoursesByTeacher(userId);

      return res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      const { statusCode, message } = toPublicError(
        error,
        'Không thể tải danh sách khóa học của giảng viên lúc này.',
        'Lỗi khi tải khóa học của giảng viên:'
      );
      return res.status(statusCode).json({
        success: false,
        message
      });
    }
  }

  // ==========================================
  // 3. READ - Lấy chi tiết một khóa học theo id
  // ==========================================
  async getCourseDetail(req, res) {
    const courseId = parsePositiveInteger(req.params.id, null);
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'ID khóa học không hợp lệ.'
      });
    }

    try {
      const userId = req.user ? req.user.id : null;
      const userRole = req.user ? req.user.role : null;
      const course = await courseService.getCourseById(courseId, userId, userRole);

      return res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      const { statusCode, message } = toPublicError(
        error,
        'Không thể tải chi tiết khóa học lúc này.',
        'Lỗi khi tải chi tiết khóa học:'
      );
      return res.status(statusCode).json({
        success: false,
        message
      });
    }
  }

  // ==========================================
  // 4. UPDATE - Cập nhật thông tin khóa học
  // ==========================================
  async updateCourse(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const userRole = req.user ? req.user.role : 'teacher';
      const courseId = req.params.id;
      const updateData = req.body;

      const updatedCourse = await courseService.updateCourse(userId, courseId, updateData, userRole);
      return res.status(200).json({
        success: true,
        message: 'Cập nhật khóa học thành công!',
        data: updatedCourse
      });
    } catch (error) {
      const { statusCode, message } = toPublicError(
        error,
        'Không thể cập nhật khóa học lúc này.',
        'Lỗi khi cập nhật khóa học:'
      );
      return res.status(statusCode).json({
        success: false,
        message
      });
    }
  }

 // ==========================================
  // 5. DELETE - Xóa khóa học
  // ==========================================
  async deleteCourse(req, res) {
    try {
      const userId = req.user ? req.user.id : req.userId;
      const userRole = req.user ? req.user.role : 'teacher'; // Lấy role để Service kiểm tra quyền Admin
      const courseId = req.params.id;

      await courseService.deleteCourse(userId, courseId, userRole);
      return res.status(200).json({
        success: true,
        message: 'Xóa khóa học thành công!'
      });
    } catch (error) {
      const { statusCode, message } = toPublicError(
        error,
        'Không thể xóa khóa học lúc này.',
        'Lỗi khi xóa khóa học:'
      );
      return res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
}

const courseController = new CourseController();
courseController.listCourses = listCourses;

module.exports = courseController;
//AI-assisted: <Gemini> [AI-02]
