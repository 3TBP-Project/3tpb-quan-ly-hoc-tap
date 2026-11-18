const enrollmentRepository = require('../repositories/enrollmentRepository');
const courseRepository = require('../repositories/courseRepository');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class EnrollmentService {
  async enroll(userId, courseId) {
    const normalizedCourseId = Number(courseId);
    if (!Number.isInteger(normalizedCourseId) || normalizedCourseId <= 0) {
      throw createError('Mã khóa học không hợp lệ.', 400);
    }

    const course = await courseRepository.findById(normalizedCourseId);
    if (!course) throw createError('Không tìm thấy khóa học.', 404);
    if (String(course.status).toLowerCase() !== 'public') {
      throw createError('Chỉ có thể ghi danh vào khóa học đang công khai.', 400);
    }

    const existingEnrollment = await enrollmentRepository.findByStudentAndCourse(userId, normalizedCourseId);
    if (existingEnrollment) {
      throw createError('Bạn đã ghi danh khóa học này rồi.', 409);
    }

    try {
      const enrollmentId = await enrollmentRepository.create(userId, normalizedCourseId);
      return { id: enrollmentId, user_id: userId, course_id: normalizedCourseId };
    } catch (error) {
      // Unique key (user_id, course_id) bảo vệ cả trường hợp hai request đến đồng thời.
      if (error.code === 'ER_DUP_ENTRY') {
        throw createError('Bạn đã ghi danh khóa học này rồi.', 409);
      }
      throw error;
    }
  }

  async getMyCourses(userId) {
    return enrollmentRepository.findCoursesByStudent(userId);
  }
}

module.exports = new EnrollmentService();
