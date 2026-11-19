const enrollmentService = require('../services/enrollmentService');
const { toPublicError } = require('../utils/errorResponse');

const parsePositiveId = (value) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const enroll = async (req, res) => {
  const courseId = parsePositiveId(req.params.courseId);
  if (!courseId) {
    return res.status(400).json({ status: 'error', message: 'ID khóa học không hợp lệ.' });
  }

  try {
    const data = await enrollmentService.enroll(req.user.id, courseId);
    return res.status(data.alreadyEnrolled ? 200 : 201).json({
      status: 'success',
      message: data.alreadyEnrolled ? 'Bạn đã ghi danh khóa học này.' : 'Ghi danh khóa học thành công.',
      data
    });
  } catch (error) {
    const { statusCode, message } = toPublicError(
      error,
      'Không thể ghi danh khóa học lúc này.',
      'Lỗi khi ghi danh khóa học:'
    );
    return res.status(statusCode).json({ status: 'error', message });
  }
};

module.exports = { enroll };
