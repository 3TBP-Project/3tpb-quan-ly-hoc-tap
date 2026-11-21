/**
 * Service xử lý logic nghiệp vụ cho Quản lý khóa học (HT-09)
 * Đảm bảo kiểm tra quyền sở hữu của giảng viên (HT-NFR3) và xử lý dữ liệu an toàn
 */
const courseRepository = require('../repositories/courseRepository');

const createCourseError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class CourseService {

  // ==========================================
  // 1. CREATE - Tạo khóa học mới cho giảng viên
  // ==========================================
  async createCourse(userId, courseData) {
    const payload = {
      title: courseData.title,
      description: courseData.description || null,
      category_id: courseData.category_id,
      user_id: userId,
      price_course: courseData.price_course !== undefined ? courseData.price_course : 0,
      quiz_minutes: courseData.quiz_minutes ?? courseData.quiz_duration ?? null,
      thumbnail: courseData.thumbnail || null,
      status: courseData.status || 'draft'
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
  async getCourseById(id, userId = null) {
    const course = await courseRepository.findDetailById(id, userId);
    // HT-15: khóa học đã bị ẩn chỉ giảng viên sở hữu còn xem được
    if (!course || (course.status === 'hidden' && course.teacherId !== userId)) {
      throw createCourseError('Không tìm thấy khóa học!', 404);
    }

    const lessons = await courseRepository.findLessonSummariesByCourseId(id);
    return { ...course, lessons };
  }

  // ==========================================
  // 4. UPDATE - Cập nhật khóa học (Kiểm tra quyền sở hữu & Merge dữ liệu)
  // ==========================================
  async updateCourse(userId, courseId, updateData, userRole = 'teacher') {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw createCourseError('Không tìm thấy khóa học!', 404);
    }

    if (course.user_id !== userId && userRole !== 'admin') {
      throw createCourseError('Bạn không có quyền chỉnh sửa khóa học này!', 403);
    }

    const mergedData = {
      title: updateData.title !== undefined ? updateData.title : course.title,
      description: updateData.description !== undefined ? updateData.description : course.description,
      category_id: updateData.category_id !== undefined ? updateData.category_id : course.category_id,
      price_course: updateData.price_course !== undefined ? updateData.price_course : course.price_course,
      quiz_minutes: updateData.quiz_minutes !== undefined
        ? updateData.quiz_minutes
        : updateData.quiz_duration !== undefined
          ? updateData.quiz_duration
          : course.quiz_minutes,
      thumbnail: updateData.thumbnail !== undefined ? updateData.thumbnail : course.thumbnail,
      status: updateData.status !== undefined ? updateData.status : course.status
    };

    // HT-15: giảng viên chỉ đặt Nháp/Công khai; khóa học bị ẩn chỉ quản trị viên bỏ ẩn được
    if (userRole !== 'admin') {
      if (course.status === 'hidden') {
        mergedData.status = 'hidden';
      } else if (mergedData.status === 'hidden') {
        throw createCourseError('Giảng viên chỉ được đặt khóa học ở trạng thái Nháp hoặc Công khai.', 400);
      }
    }

    await courseRepository.update(courseId, mergedData);
    return await courseRepository.findById(courseId);
  }

  // ==========================================
  // 5. DELETE - Xóa khóa học (Kiểm tra quyền sở hữu)
  // ==========================================
  async deleteCourse(userId, courseId, userRole = 'teacher') {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw createCourseError('Không tìm thấy khóa học!', 404);
    }

    if (course.user_id !== userId && userRole !== 'admin') {
      throw createCourseError('Bạn không có quyền xóa khóa học này!', 403);
    }

    const affectedRows = await courseRepository.remove(courseId);
    return affectedRows > 0;
  }
}

module.exports = new CourseService();
//AI-assisted: <Gemini> [AI-03]