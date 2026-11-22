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
    if (!courseData || typeof courseData !== 'object' || Array.isArray(courseData)) {
      throw createCourseError('Dữ liệu khóa học không hợp lệ.', 400);
    }

    const title = typeof courseData.title === 'string' ? courseData.title.trim() : '';
    if (title.length === 0 || title.length > 255) {
      throw createCourseError('Tên khóa học phải từ 1 đến 255 ký tự.', 400);
    }

    const categoryId = Number(courseData.category_id);
    if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
      throw createCourseError('Vui lòng chọn danh mục hợp lệ.', 400);
    }

    const status = courseData.status ?? 'draft';
    if (!['draft', 'public'].includes(status)) {
      throw createCourseError('Giảng viên chỉ được đặt khóa học ở trạng thái Nháp hoặc Công khai.', 400);
    }

    const price = courseData.price_course ?? 0;
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      throw createCourseError('Học phí phải là số không âm.', 400);
    }

    const quizMinutes = courseData.quiz_minutes ?? courseData.quiz_duration ?? null;
    if (quizMinutes !== null && (!Number.isSafeInteger(quizMinutes) || quizMinutes < 1)) {
      throw createCourseError('Thời gian làm bài phải là số phút nguyên dương.', 400);
    }

    const payload = {
      title,
      description: typeof courseData.description === 'string' && courseData.description.trim()
        ? courseData.description.trim()
        : null,
      category_id: categoryId,
      user_id: userId,
      price_course: price,
      quiz_minutes: quizMinutes,
      thumbnail: courseData.thumbnail || null,
      status
    };

    let courseId;
    try {
      courseId = await courseRepository.create(payload);
    } catch (error) {
      if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw createCourseError('Danh mục không tồn tại.', 400);
      }
      throw error;
    }
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
  async getCourseById(id, userId = null, userRole = null) {
    const course = await courseRepository.findDetailById(id, userId);
    if (!course) {
      throw createCourseError('Không tìm thấy khóa học!', 404);
    }

    // Khóa học chưa công khai chỉ người quản lý xem được:
    // - draft: giảng viên sở hữu, quản trị viên, học viên đã ghi danh trước đó
    // - hidden (HT-15): giảng viên sở hữu, quản trị viên
    const isManager = (userId != null && Number(course.teacherId) === Number(userId)) || userRole === 'admin';
    const canView =
      course.status === 'public' ||
      isManager ||
      (course.status === 'draft' && course.isEnrolled);
    if (!canView) {
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

    if (Number(course.user_id) !== Number(userId) && userRole !== 'admin') {
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

    if (!['draft', 'public', 'hidden'].includes(mergedData.status)) {
      throw createCourseError('Trạng thái khóa học không hợp lệ.', 400);
    }

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

    if (Number(course.user_id) !== Number(userId) && userRole !== 'admin') {
      throw createCourseError('Bạn không có quyền xóa khóa học này!', 403);
    }

    const affectedRows = await courseRepository.remove(courseId);
    return affectedRows > 0;
  }
}

module.exports = new CourseService();
//AI-assisted: <Gemini> [AI-03]