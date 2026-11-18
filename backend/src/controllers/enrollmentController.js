const enrollmentService = require('../services/enrollmentService');

class EnrollmentController {
  async enroll(req, res) {
    try {
      const enrollment = await enrollmentService.enroll(req.user.id, req.params.courseId);
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
  }

  async getMyCourses(req, res) {
    try {
      const courses = await enrollmentService.getMyCourses(req.user.id);
      return res.status(200).json({ status: 'success', data: courses });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Không thể tải danh sách khóa học đã ghi danh.'
      });
    }
  }
}

module.exports = new EnrollmentController();
