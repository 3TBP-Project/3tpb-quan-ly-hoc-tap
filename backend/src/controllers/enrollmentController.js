const enrollmentService = require('../services/enrollmentService');

const parseCourseId = (value) => {
  const courseId = Number(value);
  return Number.isSafeInteger(courseId) && courseId > 0 ? courseId : null;
};

const enroll = async (req, res) => {
  const courseId = parseCourseId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }

  try {
    const enrollment = await enrollmentService.enroll(req.user.id, courseId);
    return res.status(201).json({
      status: 'success',
      message: 'Ghi danh khóa học thành công!',
      data: enrollment
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Không thể ghi danh khóa học.'
    });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const courses = await enrollmentService.getMyCourses(req.user.id);
    return res.status(200).json({ status: 'success', data: courses });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Không thể tải danh sách khóa học của bạn.'
    });
  }
};

module.exports = { enroll, getMyCourses };
