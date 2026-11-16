/**
 * Service xử lý logic nghiệp vụ cho Quản lý khóa học (HT-09)
 * Đảm bảo kiểm tra quyền sở hữu của giảng viên (HT-NFR3)
 */
const courseRepository = require('../repositories/courseRepository');

class CourseService {

  // ==========================================
  // 1. CREATE - Tạo khóa học mới cho giảng viên
  // ==========================================
  async createCourse(userId, courseData) {
    const payload = {
      ...courseData,
      user_id: userId // Gắn ID của giảng viên đang đăng nhập làm chủ sở hữu
    };
    const courseId = await courseRepository.create(payload);
    return { id: courseId, ...payload };
  }

  // ==========================================
  // 2. READ - Lấy danh sách khóa học của giảng viên hiện tại
  // ==========================================
  async getCoursesByTeacher(userId) {
    return await courseRepository.findByTeacherId(userId);
  }

  // ==========================================
  // 3. READ - Lấy chi tiết một khóa học
  // ==========================================
  async getCourseById(id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error('Không tìm thấy khóa học!');
    }
    return course;
  }

  // ==========================================
  // 4. UPDATE - Cập nhật khóa học (Kiểm tra quyền sở hữu HT-NFR3)
  // ==========================================
  async updateCourse(userId, courseId, updateData) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Không tìm thấy khóa học!');
    }

    // Kiểm tra chủ sở hữu: Giảng viên chỉ được sửa khóa học của chính mình
    if (course.user_id !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa khóa học này!');
    }

    await courseRepository.update(courseId, updateData);
    return { id: courseId, ...updateData };
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học (Kiểm tra quyền sở hữu HT-NFR3)
  // ==========================================
  async deleteCourse(userId, courseId) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Không tìm thấy khóa học!');
    }

    // Kiểm tra chủ sở hữu: Giảng viên chỉ được xóa khóa học của chính mình
    if (course.user_id !== userId) {
      throw new Error('Bạn không có quyền xóa khóa học này!');
    }

    const affectedRows = await courseRepository.remove(courseId);
    return affectedRows > 0;
  }
}

module.exports = new CourseService();
