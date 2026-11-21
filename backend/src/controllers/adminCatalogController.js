// AI-assisted [AI-07]
// HT-15: Danh mục và duyệt khóa học
const catalogService = require('../services/catalogService');
const { toPublicError } = require('../utils/errorResponse');

const handleError = (res, error, fallback, context) => {
  const { statusCode, message } = toPublicError(error, fallback, context);
  return res.status(statusCode).json({ status: 'error', message });
};

const listCategories = async (_req, res) => {
  try {
    const data = await catalogService.listCategories();
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải danh mục.', 'Lỗi khi tải danh mục (quản trị):');
  }
};

const createCategory = async (req, res) => {
  try {
    const data = await catalogService.createCategory(req.body ?? {});
    return res.status(201).json({ status: 'success', message: 'Đã thêm danh mục.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể thêm danh mục.', 'Lỗi khi thêm danh mục:');
  }
};

const updateCategory = async (req, res) => {
  try {
    const data = await catalogService.updateCategory(req.params.id, req.body ?? {});
    return res.status(200).json({ status: 'success', message: 'Đã cập nhật danh mục.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể cập nhật danh mục.', 'Lỗi khi cập nhật danh mục:');
  }
};

const deleteCategory = async (req, res) => {
  try {
    await catalogService.deleteCategory(req.params.id);
    return res.status(200).json({ status: 'success', message: 'Đã xóa danh mục.' });
  } catch (error) {
    return handleError(res, error, 'Không thể xóa danh mục.', 'Lỗi khi xóa danh mục:');
  }
};

const listCourses = async (_req, res) => {
  try {
    const data = await catalogService.listCourses();
    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    return handleError(res, error, 'Không thể tải danh sách khóa học.', 'Lỗi khi tải khóa học (quản trị):');
  }
};

const hideCourse = async (req, res) => {
  try {
    const data = await catalogService.setCourseHidden(req.params.id, true);
    return res.status(200).json({ status: 'success', message: 'Đã ẩn khóa học.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể ẩn khóa học.', 'Lỗi khi ẩn khóa học:');
  }
};

const unhideCourse = async (req, res) => {
  try {
    const data = await catalogService.setCourseHidden(req.params.id, false);
    return res.status(200).json({ status: 'success', message: 'Đã bỏ ẩn khóa học.', data });
  } catch (error) {
    return handleError(res, error, 'Không thể bỏ ẩn khóa học.', 'Lỗi khi bỏ ẩn khóa học:');
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listCourses,
  hideCourse,
  unhideCourse
};
