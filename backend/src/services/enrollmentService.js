const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const enroll = async (userId, courseId) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw createHttpError('Không tìm thấy khóa học.', 404);
  }

  const created = await enrollmentRepository.create(userId, courseId);
  return { courseId, enrolled: true, alreadyEnrolled: !created };
};

module.exports = { enroll };
