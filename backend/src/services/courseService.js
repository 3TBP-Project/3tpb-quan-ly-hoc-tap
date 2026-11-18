/**
 * Service xử lý logic nghiệp vụ cho Quản lý khóa học (HT-09)
 * Đảm bảo kiểm tra quyền sở hữu của giảng viên (HT-NFR3) và xử lý dữ liệu an toàn
 */
const courseRepository = require('../repositories/courseRepository');

class CourseService {

  // ==========================================
  // 1. CREATE - Tạo khóa học mới cho giảng viên
  // ==========================================
  async createCourse(userId, courseData) {
    const payload = {
      title: courseData.title,
      description: courseData.description || null,
      category_id: courseData.category_id,
      user_id: userId, // Gắn ID của giảng viên đang đăng nhập làm chủ sở hữu
      price_course: courseData.price_course !== undefined ? courseData.price_course : 0,
      quiz_duration: courseData.quiz_duration !== undefined ? courseData.quiz_duration : null,
      thumbnail: courseData.thumbnail || null,
      status: courseData.status || 'draft' // Mặc định là nháp khi mới tạo theo yêu cầu HT-09
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
  // 4. UPDATE - Cập nhật khóa học (Kiểm tra quyền sở hữu & Merge dữ liệu)
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

    // Trộn dữ liệu cũ và mới để hỗ trợ cập nhật từng phần (tránh bị mất dữ liệu các cột không truyền lên)
    const mergedData = {
      title: updateData.title !== undefined ? updateData.title : course.title,
      description: updateData.description !== undefined ? updateData.description : course.description,
      category_id: updateData.category_id !== undefined ? updateData.category_id : course.category_id,
      price_course: updateData.price_course !== undefined ? updateData.price_course : course.price_course,
      quiz_duration: updateData.quiz_duration !== undefined ? updateData.quiz_duration : course.quiz_duration,
      thumbnail: updateData.thumbnail !== undefined ? updateData.thumbnail : course.thumbnail,
      status: updateData.status !== undefined ? updateData.status : course.status,
    };

    await courseRepository.update(courseId, mergedData);
    
    // Trả về dữ liệu mới nhất từ database
    return await courseRepository.findById(courseId);
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học (Kiểm tra quyền sở hữu)
  // ==========================================
  async deleteCourse(userId, courseId, userRole = 'teacher') {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Không tìm thấy khóa học!');
    }

    // Kiểm tra quyền: Giảng viên sở hữu HOẶC Quản trị viên (admin) mới được phép xóa
    if (course.user_id !== userId && userRole !== 'admin') {
      throw new Error('Bạn không có quyền xóa khóa học này!');
    }

    const affectedRows = await courseRepository.remove(courseId);
    return affectedRows > 0;
  }
}

module.exports = new CourseService();