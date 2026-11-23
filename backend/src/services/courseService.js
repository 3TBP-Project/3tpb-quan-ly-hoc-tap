/**
 * Service xử lý logic nghiệp vụ cho Quản lý khóa học (HT-09)
 * Đảm bảo kiểm tra quyền sở hữu của giảng viên (HT-NFR3) và validate dữ liệu an toàn
 */
const courseRepository = require('../repositories/courseRepository');

const createCourseError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const validateCoursePayload = (data, { allowHidden = false } = {}) => {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (title.length === 0 || title.length > 255) {
    throw createCourseError('Tên khóa học phải từ 1 đến 255 ký tự.', 400);
  }

  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    throw createCourseError('Mô tả khóa học phải là chuỗi ký tự.', 400);
  }
  const description = typeof data.description === 'string' && data.description.trim()
    ? data.description.trim()
    : null;

  const categoryId = Number(data.category_id);
  if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
    throw createCourseError('Vui lòng chọn danh mục hợp lệ.', 400);
  }

  const rawPrice = data.price_course === undefined || data.price_course === null ? 0 : data.price_course;
  if (typeof rawPrice === 'boolean' || (typeof rawPrice === 'string' && rawPrice.trim() === '')) {
    throw createCourseError('Học phí phải là số không âm.', 400);
  }
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price < 0) {
    throw createCourseError('Học phí phải là số không âm.', 400);
  }

  const rawQuizMinutes = data.quiz_minutes !== undefined ? data.quiz_minutes : data.quiz_duration;
  let quizMinutes = null;
  if (rawQuizMinutes !== undefined && rawQuizMinutes !== null && rawQuizMinutes !== '') {
    const parsedQuizMinutes = Number(rawQuizMinutes);
    if (!Number.isSafeInteger(parsedQuizMinutes) || parsedQuizMinutes < 1) {
      throw createCourseError('Thời gian làm bài phải là số phút nguyên dương.', 400);
    }
    quizMinutes = parsedQuizMinutes;
  }

  let thumbnail = null;
  if (data.thumbnail !== undefined && data.thumbnail !== null) {
    if (typeof data.thumbnail !== 'string') {
      throw createCourseError('Đường dẫn ảnh bìa phải là chuỗi ký tự.', 400);
    }
    const trimmedThumbnail = data.thumbnail.trim();
    if (trimmedThumbnail.length > 255) {
      throw createCourseError('Đường dẫn ảnh bìa không được vượt quá 255 ký tự.', 400);
    }
    thumbnail = trimmedThumbnail || null;
  }

  const status = data.status ?? 'draft';
  const validStatuses = allowHidden ? ['draft', 'public', 'hidden'] : ['draft', 'public'];
  if (!validStatuses.includes(status)) {
    throw createCourseError(
      allowHidden
        ? 'Trạng thái khóa học không hợp lệ.'
        : 'Giảng viên chỉ được đặt khóa học ở trạng thái Nháp hoặc Công khai.',
      400
    );
  }

  return {
    title,
    description,
    category_id: categoryId,
    price_course: price,
    quiz_minutes: quizMinutes,
    thumbnail,
    status
  };
};

class CourseService {

  // ==========================================
  // 1. CREATE - Tạo khóa học mới cho giảng viên
  // ==========================================
  async createCourse(userId, courseData) {
    if (!isPlainObject(courseData)) {
      throw createCourseError('Dữ liệu khóa học không hợp lệ.', 400);
    }

    const validated = validateCoursePayload(courseData, { allowHidden: false });
    const payload = {
      ...validated,
      user_id: userId
    };

    try {
      const courseId = await courseRepository.create(payload);
      return { id: courseId, ...payload };
    } catch (error) {
      if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw createCourseError('Danh mục không tồn tại.', 400);
      }
      throw error;
    }
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
  // 4. UPDATE - Cập nhật khóa học (Kiểm tra quyền sở hữu, validate & Merge dữ liệu)
  // ==========================================
  async updateCourse(userId, courseId, updateData, userRole = 'teacher') {
    if (!isPlainObject(updateData) || Object.keys(updateData).length === 0) {
      throw createCourseError('Cần gửi ít nhất một trường hợp lệ để cập nhật khóa học.', 400);
    }

    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw createCourseError('Không tìm thấy khóa học!', 404);
    }

    if (Number(course.user_id) !== Number(userId) && userRole !== 'admin') {
      throw createCourseError('Bạn không có quyền chỉnh sửa khóa học này!', 403);
    }

    const mergedInput = {
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

    const validated = validateCoursePayload(mergedInput, { allowHidden: true });

    if (userRole !== 'admin') {
      if (course.status === 'hidden') {
        validated.status = 'hidden';
      } else if (validated.status === 'hidden') {
        throw createCourseError('Giảng viên chỉ được đặt khóa học ở trạng thái Nháp hoặc Công khai.', 400);
      }
    }

    try {
      await courseRepository.update(courseId, validated);
    } catch (error) {
      if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        throw createCourseError('Danh mục không tồn tại.', 400);
      }
      throw error;
    }

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
