const catalogRepository = require('../repositories/catalogRepository');

const listCategories = async (_req, res) => {
  try {
    const categories = await catalogRepository.findCategories();
    return res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Lỗi khi tải danh sách danh mục:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách danh mục.'
    });
  }
};

const listTeachers = async (_req, res) => {
  try {
    const teachers = await catalogRepository.findTeachers();
    return res.status(200).json({ status: 'success', data: teachers });
  } catch (error) {
    console.error('Lỗi khi tải danh sách giảng viên:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách giảng viên.'
    });
  }
};

module.exports = {
  listCategories,
  listTeachers
};
