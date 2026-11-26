const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class EnrollmentService {
  async enroll(studentId, courseId) {
    const course = await (
      enrollmentRepository.findCourseById
        ? enrollmentRepository.findCourseById(courseId)
        : courseRepository.findById(courseId)
    );

    if (!course) {
      throw createError('Không tìm thấy khóa học.', 404);
    }

    if (course.status && course.status !== 'public') {
      throw createError('Chỉ được ghi danh vào khóa học đang công khai.', 400);
    }

    const publicLessonCount = await enrollmentRepository.countPublicLessons(courseId);
    if (publicLessonCount < 1) {
      throw createError('Khóa học này chưa có bài học công khai.', 400);
    }

    const existingEnrollment = enrollmentRepository.findByStudentAndCourse
      ? await enrollmentRepository.findByStudentAndCourse(studentId, courseId)
      : await enrollmentRepository.exists(studentId, courseId);

    if (existingEnrollment) {
      throw createError('Bạn đã ghi danh khóa học này rồi.', 409);
    }

    try {
      const enrollmentId = await enrollmentRepository.create(studentId, courseId);
      return {
        id: enrollmentId,
        studentId,
        courseId,
        enrolled: true,
        alreadyEnrolled: false
      };
    } catch (error) {
      // Ràng buộc UNIQUE(user_id, course_id) xử lý cả trường hợp hai request đồng thời.
      if (error.code === 'ER_DUP_ENTRY') {
        throw createError('Bạn đã ghi danh khóa học này rồi.', 409);
      }
      throw error;
    }
  }

  async getMyCourses(studentId) {
    return enrollmentRepository.findCoursesByStudent(studentId);
  }
}

module.exports = new EnrollmentService();
