// AI-assisted [AI-05]
const courseRepository = require('../repositories/courseRepository');

const parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const listCourses = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 9);

  if (!page || !limit || limit > 100) {
    return res.status(400).json({
      status: 'error',
      message: 'Tham số page và limit phải là số nguyên dương; limit tối đa là 100.'
    });
  }

  try {
    const { courses, total } = await courseRepository.findPage({ page, limit });

    return res.status(200).json({
      status: 'success',
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi tải danh sách khóa học:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách khóa học.'
    });
  }
};

module.exports = { listCourses };
